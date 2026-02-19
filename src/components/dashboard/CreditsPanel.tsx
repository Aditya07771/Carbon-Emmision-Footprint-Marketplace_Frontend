// src/components/dashboard/CreditsPanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCredits } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import CreditCard from './CreditCard';
// import CreditCard from './CreditCard';

export default function CreditsPanel() {
  const { walletAddress } = useWallet();
  const { credits, loading, error, fetchCredits } = useCredits();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const filteredCredits = credits.filter(credit => {
    if (filter === 'all') return true;
    return credit.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Credits</h2>
          <p className="text-white/50 text-sm">Manage your carbon credits</p>
        </div>
        
        <div className="flex items-center gap-2">
          {['all', 'active', 'listed', 'retired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-leaf text-forest-dark'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchCredits()}
            className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-red-300 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-white/50 text-lg mb-2">No credits found</p>
          <p className="text-white/30 text-sm">Issue your first carbon credit to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCredits.map((credit, index) => (
            <motion.div
              key={credit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CreditCard credit={credit} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}