// src/pages/BusinessDashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

// Import Business-specific panels
import MarketplacePanel from '@/components/dashboard/MarketplacePanel';
import RetirementPanel from '@/components/dashboard/RetirementPanel';
import ExplorerPanel from '@/components/dashboard/ExplorerPanel';
import VerifyPanel from '@/components/dashboard/VerifyPanel';
import StatsCard from '@/components/dashboard/StatsCard';
import api from '@/services/api';
import { toast } from 'sonner';

const businessMenuItems = [
  { id: 'overview', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'marketplace', label: 'Buy Credits', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'retirements', label: 'My Retirements', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'portfolio', label: 'My Portfolio', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'verify', label: 'Verify Certificate', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'explorer', label: 'Public Profile', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'sustainability', label: 'Sustainability Goals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function BusinessDashboard() {
  const { isConnected, walletAddress, userData } = useWallet();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalRetired: 0,
    creditsHeld: 0,
    totalSpent: 0,
    certificates: 0,
    totalTonnesRetired: 0,
    activePurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRetirements, setRecentRetirements] = useState<any[]>([]);
  const [myCredits, setMyCredits] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    } else if (userData?.role !== 'business' && userData?.role !== 'admin') {
      navigate('/marketplace');
    }
  }, [isConnected, userData, navigate]);

  useEffect(() => {
    fetchBusinessData();
  }, [walletAddress]);

  const fetchBusinessData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      // Fetch retirements
      const retirementsRes: any = await api.getAllRetirements();
      
      // Filter retirements by company wallet
      const myRetirements = retirementsRes.data?.filter(
        (r: any) => r.company?.wallet_address === walletAddress
      ) || [];

      // Calculate total tonnes retired
      const totalTonnes = myRetirements.reduce((sum: number, r: any) => sum + (r.tonnes || 0), 0);

      // Get recent retirements (last 5)
      const recent = myRetirements.slice(0, 5);

      // Get company dashboard data
      try {
        const companyData: any = await api.getCompanyDashboard(walletAddress);
        setStats({
          totalRetired: myRetirements.length,
          creditsHeld: companyData.data?.currentCredits?.length || 0,
          totalSpent: 0, // Would need transaction history
          certificates: myRetirements.length,
          totalTonnesRetired: totalTonnes,
          activePurchases: companyData.data?.currentCredits?.length || 0,
        });
        setMyCredits(companyData.data?.currentCredits || []);
      } catch (error) {
        // Fallback if company dashboard fails
        setStats({
          totalRetired: myRetirements.length,
          creditsHeld: 0,
          totalSpent: 0,
          certificates: myRetirements.length,
          totalTonnesRetired: totalTonnes,
          activePurchases: 0,
        });
      }

      setRecentRetirements(recent);

    } catch (error) {
      console.error('Failed to fetch business data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/50">Loading Business Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <BusinessOverview stats={stats} recentRetirements={recentRetirements} onRefresh={fetchBusinessData} />;
      case 'marketplace':
        return <MarketplacePanel />;
      case 'retirements':
        return <RetirementPanel />;
      case 'portfolio':
        return <Portfolio myCredits={myCredits} />;
      case 'verify':
        return <VerifyPanel />;
      case 'explorer':
        return <ExplorerPanel />;
      case 'sustainability':
        return <SustainabilityGoals stats={stats} />;
      default:
        return <BusinessOverview stats={stats} recentRetirements={recentRetirements} onRefresh={fetchBusinessData} />;
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-forest-dark">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-forest-dark/95 backdrop-blur-sm border-r border-white/10 transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {!sidebarCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/40">Business Dashboard</p>
                  <p className="text-sm text-white font-semibold truncate">{userData?.organizationName}</p>
                </div>
              </div>
              {walletAddress && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">{truncateAddress(walletAddress)}</span>
                </div>
              )}
            </div>
          )}

          <nav className="p-3 space-y-1">
            {businessMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activePanel === item.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderPanel()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Business Overview Component
function BusinessOverview({ stats, recentRetirements, onRefresh }: { stats: any; recentRetirements: any[]; onRefresh: () => void }) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Business Dashboard</h2>
          <p className="text-white/50 text-sm mt-1">Offset your carbon footprint with verified credits</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="CO₂ Offset"
          value={`${stats.totalTonnesRetired} t`}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          color="amber"
        />
        <StatsCard
          title="Credits Held"
          value={stats.creditsHeld}
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          color="blue"
        />
        <StatsCard
          title="Retirements"
          value={stats.totalRetired}
          subtitle={`${stats.certificates} certificates`}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="purple"
        />
        <StatsCard
          title="Impact"
          value={Math.round(stats.totalTonnesRetired * 4.348)}
          subtitle="Flight equivalents"
          icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="green"
        />
      </div>

      {/* Recent Retirements */}
      {recentRetirements.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Retirements</h3>
          <div className="space-y-3">
            {recentRetirements.map((retirement) => (
              <div key={retirement.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-amber/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{retirement.project?.name || 'Carbon Credit'}</p>
                    <p className="text-white/50 text-sm">
                      {retirement.project?.verifier || 'Verified'} • {new Date(retirement.retired_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber">{retirement.tonnes}</p>
                  <p className="text-xs text-white/40">tonnes CO₂</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${retirement.ipfs_certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="View Certificate"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                  <a
                    href={`https://testnet.algoexplorer.io/tx/${retirement.txn_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="View on Blockchain"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Buy Carbon Credits</h3>
              <p className="text-white/50 text-sm">Purchase verified credits from NGOs</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#marketplace'}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber/20 to-amber/10 border border-amber/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Retire Credits</h3>
              <p className="text-white/50 text-sm">Offset emissions & get certificates</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#retirements'}
            className="w-full py-3 rounded-xl bg-amber text-forest-dark font-semibold hover:bg-amber/90 transition-colors"
          >
            Retire Now
          </button>
        </div>
      </div>

      {/* Impact Display */}
      <div className="bg-gradient-to-br from-leaf/10 to-emerald-500/5 border border-leaf/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Your Carbon Neutrality Journey</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber mb-2">{stats.totalTonnesRetired}</p>
            <p className="text-white/50 text-sm">Tonnes CO₂ Offset</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400 mb-2">
              {Math.round(stats.totalTonnesRetired * 4.348).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Flight Equivalents</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">{stats.certificates}</p>
            <p className="text-white/50 text-sm">Verified Certificates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio Component
function Portfolio({ myCredits }: { myCredits: any[] }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">My Portfolio</h2>
        <p className="text-white/50 text-sm mt-1">Carbon credits you currently hold</p>
      </div>

      {myCredits.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-white/50 text-lg mb-2">No credits in portfolio</p>
          <p className="text-white/30 text-sm mb-6">Purchase credits from the marketplace to get started</p>
          <button 
            onClick={() => window.location.hash = '#marketplace'}
            className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCredits.map((credit) => (
            <div key={credit['asset-id']} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-white/40 font-mono">ASA #{credit['asset-id']}</p>
                  <h4 className="text-white font-semibold mt-1">{credit.params?.name || 'Carbon Credit'}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  HELD
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Amount</span>
                  <span className="text-white font-semibold">{credit.amount} units</span>
                </div>
                {credit.params?.['unit-name'] && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Unit</span>
                    <span className="text-white/70">{credit.params['unit-name']}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sustainability Goals Component
function SustainabilityGoals({ stats }: { stats: any }) {
  const { userData } = useWallet();
  const annualTarget = 1000; // Example target
  const progress = (stats.totalTonnesRetired / annualTarget) * 100;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Sustainability Goals</h2>
        <p className="text-white/50 text-sm mt-1">Track and manage your carbon neutrality targets</p>
      </div>

      <div className="space-y-6">
        {/* Current Goals */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Company Sustainability Goals</h3>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/70">{userData?.sustainabilityGoals || 'Achieve carbon neutrality through verified carbon credit retirement and sustainable business practices.'}</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">2024 Carbon Neutrality Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-sm">
                  Annual Target: {annualTarget} tonnes CO₂
                </span>
                <span className="text-white/70 text-sm">{Math.min(progress, 100).toFixed(1)}% Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-leaf to-emerald-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(progress, 100)}%` }} 
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-white/50">Retired: {stats.totalTonnesRetired}t</span>
                <span className="text-white/50">Remaining: {Math.max(0, annualTarget - stats.totalTonnesRetired)}t</span>
              </div>
            </div>
          </div>
        </div>

        {/* SDG Alignment */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">UN SDG Alignment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'SDG 13', name: 'Climate Action', aligned: stats.totalRetired > 0 },
              { id: 'SDG 15', name: 'Life on Land', aligned: stats.totalRetired > 0 },
              { id: 'SDG 7', name: 'Clean Energy', aligned: false },
              { id: 'SDG 12', name: 'Responsible Consumption', aligned: stats.totalRetired > 0 }
            ].map((sdg) => (
              <div 
                key={sdg.id} 
                className={`p-4 rounded-xl border text-center ${
                  sdg.aligned 
                    ? 'bg-leaf/10 border-leaf/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <p className={`font-semibold ${sdg.aligned ? 'text-leaf' : 'text-white/50'}`}>
                  {sdg.id}
                </p>
                <p className="text-white/50 text-xs mt-1">{sdg.name}</p>
                <p className={`text-xs mt-2 ${sdg.aligned ? 'text-leaf' : 'text-white/30'}`}>
                  {sdg.aligned ? '✓ Aligned' : 'Not Aligned'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/50 text-sm mb-2">Equivalent Impact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌳</span>
                  <div>
                    <p className="text-white font-semibold">{Math.round(stats.totalTonnesRetired * 50)} Trees</p>
                    <p className="text-white/40 text-xs">Grown for 10 years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✈️</span>
                  <div>
                    <p className="text-white font-semibold">{Math.round(stats.totalTonnesRetired * 4.348)} Flights</p>
                    <p className="text-white/40 text-xs">Mumbai to Delhi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="text-white font-semibold">{Math.round(stats.totalTonnesRetired * 2500)} km</p>
                    <p className="text-white/40 text-xs">Driving distance offset</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-2">Achievements</p>
              <div className="space-y-2">
                {stats.totalRetired > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/70">First Carbon Offset</span>
                  </div>
                )}
                {stats.totalTonnesRetired >= 100 && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/70">100+ Tonnes Offset</span>
                  </div>
                )}
                {stats.certificates >= 5 && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/70">5+ Retirements</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}