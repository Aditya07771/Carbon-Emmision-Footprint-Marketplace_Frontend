// src/components/dashboard/MarketplacePanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useListings } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import ListingCard from '@/components/dashboard/ListingCard';
import ListCreditForm from '@/components/dashboard/ListCreditForm';
import algosdk from 'algosdk';

// Setup Algorand Client
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

export default function MarketplacePanel() {
  const { walletAddress, peraWallet } = useWallet();
  const { listings, loading, error, fetchListings } = useListings();
  const [showListForm, setShowListForm] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [signingState, setSigningState] = useState<'idle' | 'opt-in' | 'payment' | 'confirming'>('idle');

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Check if user is opted into an ASA
  const checkOptIn = async (address: string, asaId: number): Promise<boolean> => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const assets = accountInfo.assets || [];
      return assets.some((asset: any) => asset['asset-id'] === asaId);
    } catch (error) {
      console.error('Error checking opt-in:', error);
      return false;
    }
  };

  // Create opt-in transaction
  const createOptInTxn = async (address: string, asaId: number) => {
    const params = await algodClient.getTransactionParams().do();
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: address,
      receiver: address,
      amount: 0,
      assetIndex: asaId,
      suggestedParams: params,
    });
  };

  // Create payment transaction
  const createPaymentTxn = async (from: string, to: string, amountAlgo: number) => {
    const params = await algodClient.getTransactionParams().do();
    const amountMicroAlgos = Math.floor(amountAlgo * 1_000_000);
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: from,
      receiver: to,
      amount: amountMicroAlgos,
      suggestedParams: params,
    });
  };

  const handleBuy = async (listing: any) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!peraWallet) {
      toast.error('Wallet not initialized');
      return;
    }

    if (listing.seller_wallet === walletAddress) {
      toast.error('You cannot buy your own listing');
      return;
    }

    setBuying(listing.id);

    try {
      const asaId = listing.asa_id;
      const sellerWallet = listing.seller_wallet;
      const priceAlgo = listing.price_algo;

      // ===== STEP 1: Check buyer's ALGO balance =====
      toast.loading('Checking balance...', { id: 'buy-process' });

      const accountInfo = await algodClient.accountInformation(walletAddress).do();
      const balanceAlgo = Number(accountInfo.amount) / 1_000_000;
      const minBalance = priceAlgo + 0.3; // Price + fees + opt-in cost

      if (balanceAlgo < minBalance) {
        throw new Error(`Insufficient balance. You need at least ${minBalance.toFixed(2)} ALGO (Price: ${priceAlgo} + fees)`);
      }

      // ===== STEP 2: Check if buyer is opted into the ASA =====
      toast.loading('Checking asset opt-in status...', { id: 'buy-process' });

      const isOptedIn = await checkOptIn(walletAddress, asaId);

      let optInTxId: string | null = null;

      if (!isOptedIn) {
        // ===== STEP 3a: Create and sign opt-in transaction =====
        toast.loading('Asset opt-in required. Please sign in Pera Wallet...', { id: 'buy-process' });
        setSigningState('opt-in');

        const optInTxn = await createOptInTxn(walletAddress, asaId);

        let signedOptIn: Uint8Array[];
        try {
          signedOptIn = await peraWallet.signTransaction([[{ txn: optInTxn }]]);
        } catch (error: any) {
          if (error?.message?.includes('cancelled') || error?.data?.type === 'SIGN_TRANSACTIONS_CANCELLED') {
            throw new Error('Opt-in cancelled by user');
          }
          throw error;
        }

        // Submit opt-in transaction
        toast.loading('Submitting opt-in transaction...', { id: 'buy-process' });
        const optInResult = await algodClient.sendRawTransaction(signedOptIn[0]).do();
        optInTxId = optInResult.txid;

        // Wait for opt-in confirmation
        toast.loading('Confirming opt-in...', { id: 'buy-process' });
        await algosdk.waitForConfirmation(algodClient, optInTxId!, 4);

        console.log('✅ Opt-in confirmed:', optInTxId);
      }

      // ===== STEP 4: Create payment transaction =====
      toast.loading('Creating payment transaction. Please sign in Pera Wallet...', { id: 'buy-process' });
      setSigningState('payment');

      const paymentTxn = await createPaymentTxn(walletAddress, sellerWallet, priceAlgo);

      let signedPayment: Uint8Array[];
      try {
        signedPayment = await peraWallet.signTransaction([[{ txn: paymentTxn }]]);
      } catch (error: any) {
        if (error?.message?.includes('cancelled') || error?.data?.type === 'SIGN_TRANSACTIONS_CANCELLED') {
          throw new Error('Payment cancelled by user');
        }
        throw error;
      }

      // ===== STEP 5: Submit payment transaction =====
      toast.loading('Submitting payment to blockchain...', { id: 'buy-process' });
      setSigningState('confirming');

      const paymentResult = await algodClient.sendRawTransaction(signedPayment[0]).do();
      const paymentTxId = paymentResult.txid;

      if (!paymentTxId) {
        throw new Error('Failed to get transaction ID');
      }

      // Wait for payment confirmation
      toast.loading('Confirming payment...', { id: 'buy-process' });
      await algosdk.waitForConfirmation(algodClient, paymentTxId, 4);

      console.log('✅ Payment confirmed:', paymentTxId);

      // ===== STEP 6: Record purchase in backend =====
      toast.loading('Recording purchase...', { id: 'buy-process' });

      await api.buyCredit({
        txnHash: paymentTxId,
        buyerWallet: walletAddress,
        asaId: asaId,
        priceAlgo: priceAlgo,
        sellerWallet: sellerWallet,
        optInTxnHash: optInTxId,
      });

      toast.success(`✅ Purchase successful! Tx: ${paymentTxId.slice(0, 8)}...`, { id: 'buy-process' });

      // Refresh listings
      fetchListings();

    } catch (error: any) {
      console.error('❌ Buy Error:', error);
      toast.error(error?.message || 'Failed to purchase credit', { id: 'buy-process' });
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
    <>
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
                {signingState === 'opt-in' ? '🔓' : signingState === 'payment' ? '💳' : '⏳'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {signingState === 'opt-in' && 'Asset Opt-In Required'}
              {signingState === 'payment' && 'Confirm Payment'}
              {signingState === 'confirming' && 'Processing Transaction'}
            </h3>

            <p className="text-white/60 text-sm mb-4">
              {signingState === 'opt-in' && 'You need to opt-in to receive this carbon credit asset.'}
              {signingState === 'payment' && 'Please confirm the payment in your Pera Wallet.'}
              {signingState === 'confirming' && 'Waiting for blockchain confirmation...'}
            </p>

            {(signingState === 'opt-in' || signingState === 'payment') && (
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

      <div>
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
    </>
  );
}