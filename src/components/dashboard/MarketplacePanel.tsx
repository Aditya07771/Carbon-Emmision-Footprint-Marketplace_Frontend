// src/components/dashboard/MarketplacePanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useListings } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import ListingCard from './ListingCard';
import ListCreditForm from './ListCreditForm';
import algosdk from 'algosdk';

// Setup Algorand Client
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

export default function MarketplacePanel() {
  const { walletAddress, peraWallet } = useWallet();
  const { listings, loading, error, fetchListings } = useListings();
  const [showListForm, setShowListForm] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [signingState, setSigningState] = useState<'idle' | 'signing' | 'confirming'>('idle');

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleBuy = async (listing: any) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!peraWallet) {
      toast.error('Wallet not initialized. Please reconnect.');
      return;
    }

    if (listing.seller_wallet === walletAddress) {
      toast.error('You cannot buy your own listing');
      return;
    }

    setBuying(listing.id);

    try {
      const asaId = Number(listing.asa_id);
      const sellerWallet = listing.seller_wallet;
      const priceAlgo = Number(listing.price_algo);

      console.log('🛒 Starting purchase:', { asaId, sellerWallet, priceAlgo, buyer: walletAddress });

      // ===== STEP 1: Check opt-in and create transactions =====
      toast.loading('Preparing transaction...', { id: 'buy-process' });

      const params = await algodClient.getTransactionParams().do();
      console.log('✅ Got suggested params');

      // Check if buyer is opted into the ASA
      let needsOptIn = true;
      try {
        const accountInfo = await algodClient.accountInformation(walletAddress).do();
        const assets = accountInfo.assets || accountInfo['assets'] || [];
        needsOptIn = !assets.some((a: any) => {
          const id = a['asset-id'] ?? a['assetId'] ?? a.assetId;
          return Number(id) === asaId;
        });
        console.log('✅ Opt-in check:', needsOptIn ? 'needs opt-in' : 'already opted in');
      } catch (err) {
        console.warn('⚠️ Could not check opt-in, will attempt opt-in:', err);
        needsOptIn = true;
      }

      // Build transaction group
      const txns: algosdk.Transaction[] = [];

      if (needsOptIn) {
        // Opt-in: 0-amount ASA transfer to self
        const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: walletAddress,
          receiver: walletAddress,
          amount: 0,
          assetIndex: asaId,
          suggestedParams: params,
        });
        txns.push(optInTxn);
      }

      // Payment transaction
      const amountMicroAlgos = Math.floor(priceAlgo * 1_000_000);
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: walletAddress,
        receiver: sellerWallet,
        amount: amountMicroAlgos,
        suggestedParams: params,
      });
      txns.push(paymentTxn);

      // If multiple txns, assign group
      if (txns.length > 1) {
        algosdk.assignGroupID(txns);
      }

      console.log(`✅ Built ${txns.length} transaction(s), sending to Pera Wallet...`);

      // ===== STEP 2: Sign with Pera Wallet =====
      toast.loading('Please sign in Pera Wallet...', { id: 'buy-process' });
      setSigningState('signing');

      // Build signer transactions for Pera
      const signerTxns = txns.map(txn => ({ txn }));

      let signedTxns: Uint8Array[];
      try {
        signedTxns = await peraWallet.signTransaction([signerTxns]);
      } catch (signError: any) {
        console.error('❌ Pera signing error:', signError);
        if (signError?.data?.type === 'SIGN_TRANSACTIONS_CANCELLED' ||
          signError?.message?.includes('cancelled') ||
          signError?.message?.includes('rejected')) {
          throw new Error('Transaction cancelled by user');
        }
        throw signError;
      }

      console.log('✅ Transactions signed, submitting to blockchain...');

      // ===== STEP 3: Submit to blockchain =====
      toast.loading('Submitting to blockchain...', { id: 'buy-process' });
      setSigningState('confirming');

      // Submit all signed transactions
      let paymentTxId: string = '';

      if (signedTxns.length > 1) {
        // Group transaction - submit all together
        const combined = new Uint8Array(signedTxns.reduce((acc, txn) => acc + txn.length, 0));
        let offset = 0;
        for (const txn of signedTxns) {
          combined.set(txn, offset);
          offset += txn.length;
        }
        const result = await algodClient.sendRawTransaction(combined).do();
        paymentTxId = result.txid || result.txId;
      } else {
        const result = await algodClient.sendRawTransaction(signedTxns[0]).do();
        paymentTxId = result.txid || result.txId;
      }

      if (!paymentTxId) {
        throw new Error('Failed to get transaction ID from blockchain');
      }

      console.log('✅ Submitted, txId:', paymentTxId);

      // Wait for confirmation
      toast.loading('Waiting for confirmation...', { id: 'buy-process' });
      await algosdk.waitForConfirmation(algodClient, paymentTxId, 4);
      console.log('✅ Transaction confirmed!');

      // ===== STEP 4: Record purchase in backend =====
      toast.loading('Recording purchase...', { id: 'buy-process' });

      await api.buyCredit({
        txnHash: paymentTxId,
        buyerWallet: walletAddress,
        asaId: asaId,
        priceAlgo: priceAlgo,
        sellerWallet: sellerWallet,
      });

      toast.success(`✅ Purchase successful! Tx: ${paymentTxId.slice(0, 8)}...`, { id: 'buy-process' });
      fetchListings();

    } catch (error: any) {
      console.error('❌ Buy Error:', error);
      let message = error?.message || 'Failed to purchase credit';

      // Better error message for common funding issue
      if (message.includes('overspend') || message.includes('insufficient')) {
        message = 'Insufficient ALGO in wallet. Please fund your account via the Testnet Dispenser.';
      }

      toast.error(message, { id: 'buy-process', duration: 5000 });
    } finally {
      setBuying(null);
      setSigningState('idle');
    }
  };

  const handleCancel = async (listing: any) => {
    if (!walletAddress || listing.seller_wallet !== walletAddress) {
      toast.error('You can only cancel your own listings');
      return;
    }

    try {
      await api.cancelListing({
        asaId: listing.asa_id,
        sellerWallet: walletAddress,
      });

      toast.success('Listing cancelled');
      fetchListings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel');
    }
  };

  return (
    <div>
      {/* Signing Overlay */}
      {signingState !== 'idle' && (
        <div
          style={{ zIndex: 999999 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#1a2e1a] border border-blue-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            <div className="mx-auto mb-6 w-20 h-20 relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {signingState === 'signing' ? '💳' : '⏳'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {signingState === 'signing' ? 'Confirm Payment' : 'Processing Transaction'}
            </h3>

            <p className="text-white/60 text-sm mb-4">
              {signingState === 'signing'
                ? 'Please confirm the transaction in your Pera Wallet app.'
                : 'Waiting for blockchain confirmation...'}
            </p>

            {signingState === 'signing' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left space-y-2 mb-4">
                <p className="text-blue-300 text-sm font-semibold">📱 Check Pera Wallet</p>
                <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                  <li>Open <strong className="text-white">Pera Wallet</strong> on your phone</li>
                  <li>Review the transaction details</li>
                  <li>Tap <strong className="text-white">Sign</strong> to confirm</li>
                </ol>
              </div>
            )}

            <p className="text-white/40 text-xs">Do not close this page.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Marketplace</h2>
          <p className="text-white/50 text-sm">Browse and trade carbon credits</p>
        </div>

        <button
          onClick={() => setShowListForm(!showListForm)}
          className="px-4 py-2 rounded-lg bg-leaf text-forest-dark font-medium flex items-center gap-2 hover:bg-leaf/90 transition-colors"
        >
          {showListForm ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List Credit
            </>
          )}
        </button>
      </div>

      {showListForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <ListCreditForm
            onSuccess={() => {
              setShowListForm(false);
              fetchListings();
            }}
          />
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchListings()}
            className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-red-300 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-white/50 text-lg mb-2">No listings available</p>
          <p className="text-white/30 text-sm">Be the first to list a carbon credit</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListingCard
                listing={listing}
                onBuy={() => handleBuy(listing)}
                onCancel={() => handleCancel(listing)}
                isBuying={buying === listing.id}
                isOwner={listing.seller_wallet === walletAddress}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}