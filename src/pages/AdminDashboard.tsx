// src/pages/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/dashboard/StatsCard';
import api from '@/services/api';
import { toast } from 'sonner';

const adminMenuItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'pending', label: 'Pending Approvals', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'ngos', label: 'NGO Directory', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'businesses', label: 'Business Directory', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'credits', label: 'All Credits', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'marketplace', label: 'Marketplace Activity', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'retirements', label: 'All Retirements', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'analytics', label: 'Platform Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings', label: 'Platform Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

interface PendingUser {
  id: string;
  wallet_address: string;
  organization_name: string;
  email: string;
  country: string;
  description: string;
  role: string;
  createdAt: string;
  registration_number?: string;
  ngo_type?: string;
  company_type?: string;
  industry?: string;
}

export default function AdminDashboard() {
  const { isConnected, walletAddress, userData } = useWallet();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    } else if (userData?.role !== 'admin') {
      navigate('/marketplace');
    }
  }, [isConnected, userData, navigate]);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/50">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <AdminOverview />;
      case 'pending':
        return <PendingApprovals />;
      case 'users':
        return <UserManagement />;
      case 'ngos':
        return <NgoDirectory />;
      case 'businesses':
        return <BusinessDirectory />;
      case 'credits':
        return <AllCredits />;
      case 'marketplace':
        return <MarketplaceActivity />;
      case 'retirements':
        return <AllRetirements />;
      case 'analytics':
        return <PlatformAnalytics />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <AdminOverview />;
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-forest-dark">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-forest-dark/95 backdrop-blur-sm border-r border-white/10 transition-all duration-300 z-30 overflow-y-auto ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-colors z-50"
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-purple-400/60">ADMINISTRATOR</p>
                  <p className="text-sm text-white font-semibold">Platform Control</p>
                </div>
              </div>
              {walletAddress && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">{truncateAddress(walletAddress)}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {adminMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activePanel === item.id
                    ? 'bg-purple-500/20 text-purple-400'
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

// ==================== ADMIN PANELS ====================

// 1. Admin Overview
function AdminOverview() {
  const { walletAddress } = useWallet();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCount: 0,
    approvedNgos: 0,
    approvedBusinesses: 0,
    totalCredits: 0,
    totalRetirements: 0,
    activeListings: 0,
    platformRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      if (!walletAddress) return;
      
      try {
        const [userStats, credits, retirements, listings]: any = await Promise.all([
          api.getAdminStats(walletAddress),
          api.getAllCredits(),
          api.getAllRetirements(),
          api.getListings(),
        ]);

        setStats({
          ...userStats.data,
          totalCredits: credits.count || 0,
          totalRetirements: retirements.count || 0,
          activeListings: listings.count || 0,
          platformRevenue: 0, // Would calculate from transactions
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
        <p className="text-white/50 text-sm mt-1">Complete platform oversight and control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="purple"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingCount}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="amber"
        />
        <StatsCard
          title="Approved NGOs"
          value={stats.approvedNgos}
          icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945"
          color="green"
        />
        <StatsCard
          title="Approved Businesses"
          value={stats.approvedBusinesses}
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
          color="blue"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Credits Issued"
          value={stats.totalCredits}
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806"
          color="green"
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293"
          color="blue"
        />
        <StatsCard
          title="Total Retirements"
          value={stats.totalRetirements}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944"
          color="amber"
        />
        <StatsCard
          title="Platform Health"
          value="Excellent"
          subtitle="All systems operational"
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944"
          color="green"
        />
      </div>

      {/* Quick Admin Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber/20 to-amber/10 border border-amber/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingCount}</p>
              <p className="text-amber/80 text-sm">Pending Approvals</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg bg-amber text-forest-dark font-semibold hover:bg-amber/90 transition-colors">
            Review Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-purple-400/80 text-sm">Total Platform Users</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold hover:bg-purple-500/30 transition-colors">
            Manage Users
          </button>
        </div>

        <div className="bg-gradient-to-br from-leaf/20 to-emerald-500/10 border border-leaf/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalCredits}</p>
              <p className="text-leaf/80 text-sm">Total Credits</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg bg-leaf/20 border border-leaf/30 text-leaf font-semibold hover:bg-leaf/30 transition-colors">
            View Analytics
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Health Monitor</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-green-400 font-semibold">API Status</span>
            </div>
            <p className="text-white/50 text-sm">Operational</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-green-400 font-semibold">Database</span>
            </div>
            <p className="text-white/50 text-sm">Connected</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-green-400 font-semibold">Algorand</span>
            </div>
            <p className="text-white/50 text-sm">TestNet Live</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-green-400 font-semibold">IPFS</span>
            </div>
            <p className="text-white/50 text-sm">Pinata Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Pending Approvals Panel
function PendingApprovals() {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(true);
  const [pendingData, setPendingData] = useState<{
    ngos: PendingUser[];
    businesses: PendingUser[];
  }>({ ngos: [], businesses: [] });
  const [activeTab, setActiveTab] = useState<'ngos' | 'businesses'>('ngos');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const fetchData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const pendingRes: any = await api.getPendingRegistrations(walletAddress);
      setPendingData(pendingRes.data);
    } catch (error) {
      toast.error('Failed to fetch pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!walletAddress) return;
    
    setProcessingId(userId);
    try {
      await api.approveRegistration(userId, walletAddress);
      toast.success('Registration approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!walletAddress || !rejectModal.userId) return;
    
    setProcessingId(rejectModal.userId);
    try {
      await api.rejectRegistration(rejectModal.userId, walletAddress, rejectReason);
      toast.success('Registration rejected');
      setRejectModal({ open: false, userId: null });
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const currentList = activeTab === 'ngos' ? pendingData.ngos : pendingData.businesses;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
        <p className="text-white/50 text-sm mt-1">Review and approve new organization registrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ngos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'ngos'
              ? 'bg-leaf text-forest-dark'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          NGOs ({pendingData.ngos.length})
        </button>
        <button
          onClick={() => setActiveTab('businesses')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'businesses'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          Businesses ({pendingData.businesses.length})
        </button>
      </div>

      {/* Pending List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white/50">No pending {activeTab} registrations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {user.organization_name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ngo' 
                        ? 'bg-leaf/20 text-leaf' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white/70">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/70">{user.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-white/70">
                        {user.ngo_type || user.industry || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-white/50 line-clamp-2 mb-3">
                    {user.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs text-white/30 font-mono">{user.wallet_address}</p>
                  </div>

                  <div className="mt-2 text-xs text-white/40">
                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-semibold disabled:opacity-50 flex items-center gap-2 hover:shadow-lg hover:shadow-leaf/20 transition-all"
                  >
                    {processingId === user.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, userId: user.id })}
                    disabled={processingId === user.id}
                    className="px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold disabled:opacity-50 hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-forest-dark border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Reject Registration</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection (will be visible to applicant)..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({ open: false, userId: null });
                  setRejectReason('');
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!processingId}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {processingId ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// 3. User Management Panel
function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch all users
    setLoading(false);
    // Mock data - replace with actual API call
    setUsers([]);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <p className="text-white/50 text-sm mt-1">Manage all platform users and their permissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'ngo', 'business', 'admin'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <p className="text-white/50">User management interface - Coming soon</p>
      </div>
    </div>
  );
}

// Simple placeholder panels for other sections
function NgoDirectory() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">NGO Directory</h2>
      <p className="text-white/50">View all approved NGOs and their activities</p>
    </div>
  );
}

function BusinessDirectory() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Business Directory</h2>
      <p className="text-white/50">View all approved businesses and their sustainability efforts</p>
    </div>
  );
}

function AllCredits() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">All Carbon Credits</h2>
      <p className="text-white/50">Monitor all issued carbon credits across the platform</p>
    </div>
  );
}

function MarketplaceActivity() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Marketplace Activity</h2>
      <p className="text-white/50">Track all marketplace listings and transactions</p>
    </div>
  );
}

function AllRetirements() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">All Retirements</h2>
      <p className="text-white/50">View all carbon credit retirements and certificates</p>
    </div>
  );
}

function PlatformAnalytics() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Platform Analytics</h2>
      <p className="text-white/50">Comprehensive analytics and insights</p>
    </div>
  );
}

function PlatformSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Platform Settings</h2>
      <p className="text-white/50">Configure platform-wide settings and parameters</p>
    </div>
  );
}