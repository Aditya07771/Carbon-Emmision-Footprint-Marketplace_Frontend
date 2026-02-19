// src/pages/NgoDashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

// Import NGO-specific panels
import IssueCreditsForm from '@/components/dashboard/IssueCreditsForm';
import CreditsPanel from '@/components/dashboard/CreditsPanel';
import MarketplacePanel from '@/components/dashboard/MarketplacePanel';
import StatsCard from '@/components/dashboard/StatsCard';
import api from '@/services/api';

const ngoMenuItems = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'issue', label: 'Issue Credits', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'my-credits', label: 'My Credits', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'marketplace', label: 'List on Marketplace', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'profile', label: 'Organization Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

export default function NgoDashboard() {
  const { isConnected, walletAddress, userData } = useWallet();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalListed: 0,
    revenue: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    } else if (userData?.role !== 'ngo' && userData?.role !== 'admin') {
      navigate('/marketplace');
    }
  }, [isConnected, userData, navigate]);

  useEffect(() => {
    async function fetchNgoStats() {
      try {
        const credits: any = await api.getAllCredits({ status: 'active' });
        const listings: any = await api.getListings();
        
        // Filter by current user's wallet
        const myCredits = credits.data?.filter((c: any) => c.issuer_wallet === walletAddress) || [];
        const myListings = listings.data?.filter((l: any) => l.seller_wallet === walletAddress) || [];
        
        setStats({
          totalIssued: myCredits.length,
          totalListed: myListings.length,
          revenue: myListings.reduce((sum: number, l: any) => sum + (l.price_algo || 0), 0),
          activeProjects: myCredits.length,
        });
      } catch (error) {
        console.error('Failed to fetch NGO stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (walletAddress) {
      fetchNgoStats();
    }
  }, [walletAddress]);

  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf mx-auto mb-4"></div>
          <p className="text-white/50">Loading NGO Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <NgoOverview stats={stats} />;
      case 'issue':
        return <IssueCreditsForm />;
      case 'my-credits':
        return <CreditsPanel />;
      case 'marketplace':
        return <MarketplacePanel />;
      case 'profile':
        return <NgoProfile />;
      default:
        return <NgoOverview stats={stats} />;
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
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-leaf/20 border border-leaf/30 flex items-center justify-center text-leaf hover:bg-leaf/30 transition-colors"
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

          {/* Role Badge */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/40">NGO Dashboard</p>
                  <p className="text-sm text-white font-semibold">{userData?.organizationName}</p>
                </div>
              </div>
              {walletAddress && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">{truncateAddress(walletAddress)}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {ngoMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activePanel === item.id
                    ? 'bg-leaf/20 text-leaf'
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

        {/* Main Content */}
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

// NGO Overview Component
function NgoOverview({ stats }: { stats: any }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">NGO Dashboard</h2>
        <p className="text-white/50 text-sm mt-1">Issue, manage, and track your carbon credits</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Credits Issued"
          value={stats.totalIssued}
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          color="green"
        />
        <StatsCard
          title="Active Listings"
          value={stats.totalListed}
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          color="blue"
        />
        <StatsCard
          title="Potential Revenue"
          value={`${stats.revenue.toFixed(2)} ALGO`}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="amber"
        />
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="p-6 rounded-xl bg-gradient-to-br from-leaf/20 to-emerald-500/10 border border-leaf/30 text-left hover:border-leaf/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Issue New Credits</p>
            <p className="text-white/50 text-sm">Mint verified carbon credits from your projects</p>
          </button>

          <button className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-left hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">List on Marketplace</p>
            <p className="text-white/50 text-sm">Sell your credits to verified businesses</p>
          </button>

          <button className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-left hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">View Analytics</p>
            <p className="text-white/50 text-sm">Track your impact and revenue</p>
          </button>
        </div>
      </div>

      {/* Impact Section */}
      <div className="mt-8 bg-gradient-to-br from-leaf/10 to-emerald-500/5 border border-leaf/20 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-leaf/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Your Environmental Impact</h3>
            <p className="text-white/60 text-sm">Making a difference through verified carbon credits</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">{stats.totalIssued}</p>
            <p className="text-white/50 text-sm">Projects Verified</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">
              {stats.totalIssued > 0 ? (stats.totalIssued * 500).toLocaleString() : 0}
            </p>
            <p className="text-white/50 text-sm">Tonnes CO₂ Offset</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">
              {stats.totalIssued > 0 ? (stats.totalIssued * 500 * 4.348).toLocaleString() : 0}
            </p>
            <p className="text-white/50 text-sm">Flight Equivalents</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// NGO Profile Component
function NgoProfile() {
  const { userData, walletAddress } = useWallet();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Organization Profile</h2>
        <p className="text-white/50 text-sm mt-1">Manage your NGO information</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Organization Name</label>
          <input
            type="text"
            value={userData?.organizationName || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Wallet Address</label>
          <input
            type="text"
            value={walletAddress || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">NGO Type</label>
          <input
            type="text"
            value={userData?.role || 'NGO'}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-white font-semibold">Verified Organization</span>
          </div>
          <p className="text-white/50 text-sm">
            Your organization has been approved by platform administrators
          </p>
        </div>
      </div>
    </div>
  );
}