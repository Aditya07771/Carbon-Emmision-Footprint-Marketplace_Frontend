// src/components/dashboard/OverviewPanel.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import StatsCard from './StatsCard';

export default function OverviewPanel() {
  const { walletAddress } = useWallet();
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalRetired: 0,
    activeListings: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [credits, retirements, listings] = await Promise.all([
          api.getAllCredits(),
          api.getAllRetirements(),
          api.getListings(),
        ]);

        setStats({
          totalCredits: (credits as any).count || 0,
          totalRetired: (retirements as any).totalTonnes || 0,
          activeListings: (listings as any).count || 0,
          totalVolume: 0, // Would calculate from trades
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-white/50 text-sm mt-1">
          Your carbon credit management at a glance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Credits"
          value={stats.totalCredits}
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          color="green"
        />
        <StatsCard
          title="CO₂ Retired"
          value={`${stats.totalRetired.toLocaleString()}t`}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          color="amber"
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          color="blue"
        />
        <StatsCard
          title="Network"
          value="TestNet"
          subtitle="Algorand"
          icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="p-4 rounded-xl bg-leaf/10 border border-leaf/20 text-left hover:bg-leaf/20 transition-colors">
            <svg className="w-8 h-8 text-leaf mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white font-medium">Issue Credits</p>
            <p className="text-white/50 text-sm">Mint new carbon credits</p>
          </button>
          
          <button className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left hover:bg-blue-500/20 transition-colors">
            <svg className="w-8 h-8 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-white font-medium">Browse Market</p>
            <p className="text-white/50 text-sm">Buy verified credits</p>
          </button>
          
          <button className="p-4 rounded-xl bg-amber/10 border border-amber/20 text-left hover:bg-amber/20 transition-colors">
            <svg className="w-8 h-8 text-amber mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-white font-medium">Retire Credits</p>
            <p className="text-white/50 text-sm">Offset your carbon</p>
          </button>
        </div>
      </div>
    </div>
  );
}