// src/components/dashboard/MarketplacePanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useListings } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import ListingCard from './ListingCard';
import ListCreditForm from './ListCreditForm';
// import ListingCard from './ListingCard';
// import ListCreditForm from './ListCreditForm';

export default function MarketplacePanel() {
  const { walletAddress } = useWallet();
  const { listings, loading, error, fetchListings } = useListings();
  const [showListForm, setShowListForm] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleBuy = async (listing: any) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setBuying(listing.id);
    
    try {
      // In a real app, you would:
      // 1. Create the transaction
      // 2. Sign with Pera Wallet
      // 3. Submit and get txnHash
      // For demo, we'll simulate
      const mockTxnHash = `DEMO_${Date.now()}`;
      
      await api.buyCredit({
        txnHash: mockTxnHash,
        buyerWallet: walletAddress,
        asaId: listing.asa_id,
      });
      
      toast.success('Credit purchased successfully!');
      fetchListings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to purchase');
    } finally {
      setBuying(null);
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