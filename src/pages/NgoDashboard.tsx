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
import { toast } from 'sonner';

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
    totalSold: 0,
    revenue: 0,
    activeProjects: 0,
    totalTonnes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentCredits, setRecentCredits] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    } else if (userData?.role !== 'ngo' && userData?.role !== 'admin') {
      navigate('/marketplace');
    }
  }, [isConnected, userData, navigate]);

  useEffect(() => {
    fetchNgoData();
  }, [walletAddress]);

  const fetchNgoData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const [creditsRes, listingsRes]: any = await Promise.all([
        api.getAllCredits(),
        api.getListings(),
      ]);

      // Filter credits issued by this NGO
      const myCredits = creditsRes.data?.filter((c: any) => c.issuer_wallet === walletAddress) || [];
      
      // Filter listings by this NGO
      const myListings = listingsRes.data?.filter((l: any) => l.seller_wallet === walletAddress) || [];
      
      // Calculate stats
      const activeListings = myListings.filter((l: any) => l.status === 'active');
      const soldListings = myListings.filter((l: any) => l.status === 'sold');
      const totalRevenue = soldListings.reduce((sum: number, l: any) => sum + parseFloat(l.price_algo || 0), 0);
      const totalTonnes = myCredits.reduce((sum: number, c: any) => sum + (c.co2_tonnes || 0), 0);

      setStats({
        totalIssued: myCredits.length,
        totalListed: activeListings.length,
        totalSold: soldListings.length,
        revenue: totalRevenue,
        activeProjects: myCredits.filter((c: any) => c.status === 'active').length,
        totalTonnes,
      });

      // Get recent credits (last 5)
      setRecentCredits(myCredits.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch NGO data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
        return <NgoOverview stats={stats} recentCredits={recentCredits} onRefresh={fetchNgoData} />;
      case 'issue':
        return <IssueCreditsForm />;
      case 'my-credits':
        return <CreditsPanel />;
      case 'marketplace':
        return <MarketplacePanel />;
      case 'profile':
        return <NgoProfile />;
      default:
        return <NgoOverview stats={stats} recentCredits={recentCredits} onRefresh={fetchNgoData} />;
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
                  <p className="text-sm text-white font-semibold truncate">{userData?.organizationName}</p>
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
function NgoOverview({ stats, recentCredits, onRefresh }: { stats: any; recentCredits: any[]; onRefresh: () => void }) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">NGO Dashboard</h2>
          <p className="text-white/50 text-sm mt-1">Issue, manage, and track your carbon credits</p>
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
          title="Total Revenue"
          value={`${stats.revenue.toFixed(2)} ALGO`}
          subtitle={`${stats.totalSold} credits sold`}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="amber"
        />
        <StatsCard
          title="Total CO₂ Issued"
          value={`${stats.totalTonnes}t`}
          subtitle={`${stats.activeProjects} active projects`}
          icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="purple"
        />
      </div>

      {/* Recent Credits */}
      {recentCredits.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recently Issued Credits</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCredits.map((credit) => (
              <div key={credit.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-leaf/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-white/40 font-mono">ASA #{credit.asa_id}</p>
                    <h4 className="text-white font-semibold truncate">{credit.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    credit.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    credit.status === 'listed' ? 'bg-blue-500/20 text-blue-400' :
                    credit.status === 'sold' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-amber/20 text-amber'
                  }`}>
                    {credit.status?.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">CO₂</span>
                    <span className="text-white font-semibold">{credit.co2_tonnes}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Type</span>
                    <span className="text-white/70">{credit.project_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Year</span>
                    <span className="text-white/70">{credit.vintage_year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <button 
            onClick={() => window.location.hash = '#issue'}
            className="p-6 rounded-xl bg-gradient-to-br from-leaf/20 to-emerald-500/10 border border-leaf/30 text-left hover:border-leaf/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Issue New Credits</p>
            <p className="text-white/50 text-sm">Mint verified carbon credits from your projects</p>
          </button>

          <button 
            onClick={() => window.location.hash = '#marketplace'}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-left hover:border-blue-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">List on Marketplace</p>
            <p className="text-white/50 text-sm">Sell your credits to verified businesses</p>
          </button>

          <button 
            onClick={() => window.location.hash = '#my-credits'}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-left hover:border-purple-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">View All Credits</p>
            <p className="text-white/50 text-sm">Manage your issued carbon credits</p>
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
            <p className="text-4xl font-bold text-leaf mb-2">{stats.totalTonnes.toLocaleString()}</p>
            <p className="text-white/50 text-sm">Tonnes CO₂ Offset</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">
              {Math.round(stats.totalTonnes * 4.348).toLocaleString()}
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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [walletAddress]);

  const fetchProfile = async () => {
    if (!walletAddress) return;
    
    try {
      const response: any = await api.getUserProfile(walletAddress);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Organization Profile</h2>
        <p className="text-white/50 text-sm mt-1">Your NGO information and verification status</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Organization Name</label>
          <input
            type="text"
            value={profile?.organization_name || userData?.organizationName || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Country</label>
            <input
              type="text"
              value={profile?.country || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
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

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">NGO Type</label>
            <input
              type="text"
              value={profile?.ngo_type || 'Environmental Conservation'}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Registration Number</label>
            <input
              type="text"
              value={profile?.registration_number || 'N/A'}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>

        {profile?.description && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
            <textarea
              value={profile.description}
              disabled
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
            />
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-leaf/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Verified Organization</p>
              <p className="text-white/50 text-sm">Your organization has been approved by platform administrators</p>
            </div>
          </div>
        </div>

        {profile?.website && (
          <div className="pt-4 border-t border-white/10">
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-leaf hover:text-leaf/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}