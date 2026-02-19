// src/components/dashboard/RetirementPanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRetirements } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import RetirementCard from './RetirementCard';
import RetireCreditsForm from './RetireCreditsForm';
// import RetirementCard from './RetirementCard';
// import RetireCreditsForm from './RetireCreditsForm';

export default function RetirementPanel() {
  const { walletAddress } = useWallet();
  const { retirements, totalTonnes, loading, error, fetchRetirements } = useRetirements();
  const [showRetireForm, setShowRetireForm] = useState(false);

  useEffect(() => {
    fetchRetirements();
  }, [fetchRetirements]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Retirements</h2>
          <p className="text-white/50 text-sm">
            Track retired carbon credits • Total: {totalTonnes.toLocaleString()} tonnes CO₂
          </p>
        </div>
        
        <button
          onClick={() => setShowRetireForm(!showRetireForm)}
          className="px-4 py-2 rounded-lg bg-amber text-forest-dark font-medium flex items-center gap-2 hover:bg-amber/90 transition-colors"
        >
          {showRetireForm ? 'Cancel' : 'Retire Credits'}
        </button>
      </div>

      {showRetireForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8"
        >
          <RetireCreditsForm 
            onSuccess={() => {
              setShowRetireForm(false);
              fetchRetirements();
            }} 
          />
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : retirements.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-white/50 text-lg mb-2">No retirements yet</p>
          <p className="text-white/30 text-sm">Retire credits to offset your carbon footprint</p>
        </div>
      ) : (
        <div className="space-y-4">
          {retirements.map((retirement, index) => (
            <motion.div
              key={retirement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RetirementCard retirement={retirement} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}