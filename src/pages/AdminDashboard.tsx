// src/pages/AdminDashboard.tsx (COMPLETE VERSION)

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
      toast.error('Admin access required');
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
    totalTonnesIssued: 0,
    totalTonnesRetired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, [walletAddress]);

  const fetchAdminStats = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const [userStats, credits, retirements, listings, ngos, businesses]: any = await Promise.all([
        api.getAdminStats(walletAddress),
        api.getAllCredits(),
        api.getAllRetirements(),
        api.getListings(),
        api.getApprovedNgos(),
        api.getApprovedBusinesses(),
      ]);

      const totalTonnesIssued = credits.data?.reduce((sum: number, c: any) => sum + (c.co2_tonnes || 0), 0) || 0;
      const totalTonnesRetired = retirements.data?.reduce((sum: number, r: any) => sum + (r.tonnes || 0), 0) || 0;

      setStats({
        ...userStats.data,
        totalCredits: credits.count || credits.data?.length || 0,
        totalRetirements: retirements.count || retirements.data?.length || 0,
        activeListings: listings.count || listings.data?.length || 0,
        approvedNgos: ngos.count || ngos.data?.length || 0,
        approvedBusinesses: businesses.count || businesses.data?.length || 0,
        totalTonnesIssued,
        totalTonnesRetired,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-white/50 text-sm mt-1">Complete platform oversight and control</p>
        </div>
        <button
          onClick={fetchAdminStats}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Primary Stats Grid */}
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
          subtitle={`${stats.totalTonnesIssued}t CO₂`}
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
          subtitle={`${stats.totalTonnesRetired}t CO₂`}
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
        <button
          onClick={() => window.location.hash = '#pending'}
          className="bg-gradient-to-br from-amber/20 to-amber/10 border border-amber/30 rounded-2xl p-6 text-left hover:border-amber/50 transition-all"
        >
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
          <div className="py-2 rounded-lg bg-amber/20 text-amber font-semibold text-center">
            Review Now
          </div>
        </button>

        <button
          onClick={() => window.location.hash = '#users'}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 text-left hover:border-purple-500/50 transition-all"
        >
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
          <div className="py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold text-center">
            Manage Users
          </div>
        </button>

        <button
          onClick={() => window.location.hash = '#analytics'}
          className="bg-gradient-to-br from-leaf/20 to-emerald-500/10 border border-leaf/30 rounded-2xl p-6 text-left hover:border-leaf/50 transition-all"
        >
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
          <div className="py-2 rounded-lg bg-leaf/20 border border-leaf/30 text-leaf font-semibold text-center">
            View Analytics
          </div>
        </button>
      </div>

      {/* Platform Impact */}
      <div className="bg-gradient-to-br from-leaf/10 to-emerald-500/5 border border-leaf/20 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Platform Environmental Impact</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-leaf mb-2">{stats.totalTonnesIssued.toLocaleString()}</p>
            <p className="text-white/50 text-sm">Tonnes CO₂ Issued</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber mb-2">{stats.totalTonnesRetired.toLocaleString()}</p>
            <p className="text-white/50 text-sm">Tonnes CO₂ Retired</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400 mb-2">
              {Math.round(stats.totalTonnesRetired * 4.348).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Flight Equivalents</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400 mb-2">
              {Math.round(stats.totalTonnesRetired * 50).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Trees Equivalent</p>
          </div>
        </div>
      </div>

      {/* System Health Monitor */}
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
                    <p className="text-xs text-white/30 font-mono truncate">{user.wallet_address}</p>
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

// 3. User Management Panel (CONTINUED IN NEXT RESPONSE DUE TO LENGTH)
// 3. User Management Panel
function UserManagement() {
  const { walletAddress } = useWallet();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ngo' | 'business' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchAllUsers();
  }, [walletAddress]);

  const fetchAllUsers = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      // Fetch approved users from different endpoints
      const [ngos, businesses, pending]: any = await Promise.all([
        api.getApprovedNgos(),
        api.getApprovedBusinesses(),
        api.getPendingRegistrations(walletAddress),
      ]);

      // Combine all users
      const allUsers = [
        ...(ngos.data || []).map((u: any) => ({ ...u, status: 'approved' })),
        ...(businesses.data || []).map((u: any) => ({ ...u, status: 'approved' })),
        ...(pending.data?.ngos || []),
        ...(pending.data?.businesses || []),
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter !== 'all' && user.role !== filter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-white/50 text-sm mt-1">Manage all platform users and their permissions</p>
        </div>
        <button
          onClick={fetchAllUsers}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <p className="text-xs text-white/40 mb-2">Role</p>
          <div className="flex gap-2">
            {(['all', 'ngo', 'business', 'admin'] as const).map((f) => (
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
        </div>

        <div>
          <p className="text-xs text-white/40 mb-2">Status</p>
          <div className="flex gap-2">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-4">
          <p className="text-leaf/70 text-sm">NGOs</p>
          <p className="text-2xl font-bold text-leaf">{users.filter(u => u.role === 'ngo').length}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400/70 text-sm">Businesses</p>
          <p className="text-2xl font-bold text-blue-400">{users.filter(u => u.role === 'business').length}</p>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-xl p-4">
          <p className="text-amber/70 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber">{users.filter(u => u.status === 'pending').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white">
                      {user.organization_name || user.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ngo' ? 'bg-leaf/20 text-leaf' :
                        user.role === 'business' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'pending' ? 'bg-amber/20 text-amber' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{user.country || 'N/A'}</td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">
                      {user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 4. NGO Directory
function NgoDirectory() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const response: any = await api.getApprovedNgos();
      setNgos(response.data || []);
    } catch (error) {
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const filteredNgos = ngos.filter((ngo) =>
    ngo.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">NGO Directory</h2>
          <p className="text-white/50 text-sm mt-1">View all approved NGOs and their activities</p>
        </div>
        <button
          onClick={fetchNgos}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search NGOs by name or country..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
        />
      </div>

      {/* NGO Count */}
      <div className="mb-6">
        <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-4 inline-block">
          <p className="text-leaf font-semibold">
            {filteredNgos.length} Approved NGO{filteredNgos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* NGO Grid */}
      {filteredNgos.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <p className="text-white/50">No NGOs found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNgos.map((ngo) => (
            <div key={ngo.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-leaf/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-leaf/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">{ngo.organization_name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ngo.country}
                </div>
                {ngo.website && (
                  <a
                    href={ngo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-leaf hover:text-leaf/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/40 font-mono truncate">{ngo.wallet_address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. Business Directory
function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response: any = await api.getApprovedBusinesses();
      setBusinesses(response.data || []);
    } catch (error) {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((biz) =>
    biz.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    biz.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Directory</h2>
          <p className="text-white/50 text-sm mt-1">View all approved businesses and their sustainability efforts</p>
        </div>
        <button
          onClick={fetchBusinesses}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search businesses by name or industry..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Business Count */}
      <div className="mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 inline-block">
          <p className="text-blue-400 font-semibold">
            {filteredBusinesses.length} Approved Business{filteredBusinesses.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {/* Business Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <p className="text-white/50">No businesses found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((biz) => (
            <div key={biz.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">{biz.organization_name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {biz.industry || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {biz.country}
                </div>
                {biz.website && (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/40 font-mono truncate">{biz.wallet_address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 6. All Credits Panel
function AllCredits() {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'listed' | 'sold' | 'retired'>('all');

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const response: any = await api.getAllCredits();
      setCredits(response.data || []);
    } catch (error) {
      toast.error('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  const filteredCredits = filter === 'all' 
    ? credits 
    : credits.filter((c) => c.status === filter);

  const totalTonnes = credits.reduce((sum, c) => sum + (c.co2_tonnes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Carbon Credits</h2>
          <p className="text-white/50 text-sm mt-1">Monitor all issued carbon credits across the platform</p>
        </div>
        <button
          onClick={fetchCredits}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-4">
          <p className="text-leaf/70 text-sm">Total Credits</p>
          <p className="text-2xl font-bold text-leaf">{credits.length}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400/70 text-sm">Total CO₂</p>
          <p className="text-2xl font-bold text-blue-400">{totalTonnes}t</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400/70 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">{credits.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-xl p-4">
          <p className="text-amber/70 text-sm">Retired</p>
          <p className="text-2xl font-bold text-amber">{credits.filter(c => c.status === 'retired').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'listed', 'sold', 'retired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-leaf text-forest-dark'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Credits Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">ASA ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Project Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">CO₂ Tonnes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Vintage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Verifier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Issuer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/50">
                    No credits found
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-mono text-sm">{credit.asa_id}</td>
                    <td className="px-4 py-3 text-white">{credit.name}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{credit.project_type}</td>
                    <td className="px-4 py-3 text-leaf font-semibold">{credit.co2_tonnes}</td>
                    <td className="px-4 py-3 text-white/70">{credit.vintage_year}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{credit.verifier}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        credit.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        credit.status === 'listed' ? 'bg-blue-500/20 text-blue-400' :
                        credit.status === 'sold' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber/20 text-amber'
                      }`}>
                        {credit.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">
                      {credit.issuer_wallet ? `${credit.issuer_wallet.slice(0, 6)}...` : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. Marketplace Activity (CONTINUED IN NEXT RESPONSE)
// 7. Marketplace Activity Panel
function MarketplaceActivity() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'cancelled'>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response: any = await api.getListings();
      setListings(response.data || []);
    } catch (error) {
      toast.error('Failed to load marketplace activity');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = filter === 'all' 
    ? listings 
    : listings.filter((l) => l.status === filter);

  const totalVolume = listings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + parseFloat(l.price_algo || 0), 0);

  const totalTonnesListed = listings.reduce((sum, l) => sum + (l.co2_tonnes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Marketplace Activity</h2>
          <p className="text-white/50 text-sm mt-1">Track all marketplace listings and transactions</p>
        </div>
        <button
          onClick={fetchListings}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400/70 text-sm">Total Listings</p>
          <p className="text-2xl font-bold text-blue-400">{listings.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400/70 text-sm">Active Listings</p>
          <p className="text-2xl font-bold text-green-400">{listings.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-400/70 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-purple-400">{totalVolume.toFixed(2)} ALGO</p>
        </div>
        <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-4">
          <p className="text-leaf/70 text-sm">Tonnes Listed</p>
          <p className="text-2xl font-bold text-leaf">{totalTonnesListed}t</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'sold', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">ASA ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">CO₂ Tonnes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Vintage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/50">
                    No listings found
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-mono text-sm">{listing.asa_id}</td>
                    <td className="px-4 py-3 text-white">{listing.project?.name || 'Carbon Credit'}</td>
                    <td className="px-4 py-3 text-white/60 font-mono text-xs">
                      {listing.seller_wallet ? `${listing.seller_wallet.slice(0, 6)}...${listing.seller_wallet.slice(-4)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-leaf font-semibold">{listing.price_algo} ALGO</td>
                    <td className="px-4 py-3 text-white/70">{listing.co2_tonnes || 'N/A'}</td>
                    <td className="px-4 py-3 text-white/70">{listing.vintage_year || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        listing.status === 'sold' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {listing.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 8. All Retirements Panel
function AllRetirements() {
  const [retirements, setRetirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRetirements();
  }, []);

  const fetchRetirements = async () => {
    setLoading(true);
    try {
      const response: any = await api.getAllRetirements();
      setRetirements(response.data || []);
    } catch (error) {
      toast.error('Failed to load retirements');
    } finally {
      setLoading(false);
    }
  };

  const filteredRetirements = retirements.filter((r) =>
    r.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.certificate_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTonnesRetired = retirements.reduce((sum, r) => sum + (r.tonnes || 0), 0);
  const uniqueCompanies = new Set(retirements.map(r => r.company?.wallet_address).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Retirements</h2>
          <p className="text-white/50 text-sm mt-1">View all carbon credit retirements and certificates</p>
        </div>
        <button
          onClick={fetchRetirements}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber/10 border border-amber/20 rounded-xl p-4">
          <p className="text-amber/70 text-sm">Total Retirements</p>
          <p className="text-2xl font-bold text-amber">{retirements.length}</p>
        </div>
        <div className="bg-leaf/10 border border-leaf/20 rounded-xl p-4">
          <p className="text-leaf/70 text-sm">Total CO₂ Retired</p>
          <p className="text-2xl font-bold text-leaf">{totalTonnesRetired}t</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400/70 text-sm">Companies</p>
          <p className="text-2xl font-bold text-blue-400">{uniqueCompanies}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-400/70 text-sm">Impact</p>
          <p className="text-2xl font-bold text-purple-400">{Math.round(totalTonnesRetired * 4.348)}</p>
          <p className="text-xs text-purple-400/60">Flight equivalents</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company, project, or certificate ID..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-amber"
        />
      </div>

      {/* Retirements Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Certificate ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Tonnes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Verifier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Retired At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredRetirements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                    No retirements found
                  </td>
                </tr>
              ) : (
                filteredRetirements.map((retirement) => (
                  <tr key={retirement.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-amber font-mono text-sm">{retirement.certificate_id}</td>
                    <td className="px-4 py-3 text-white">{retirement.company?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-white/70">{retirement.project?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-leaf font-semibold">{retirement.tonnes}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{retirement.project?.verifier || 'N/A'}</td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {retirement.retired_at ? new Date(retirement.retired_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {retirement.ipfs_certificate && (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${retirement.ipfs_certificate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="View Certificate"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        )}
                        {retirement.txn_hash && (
                          <a
                            href={`https://testnet.algoexplorer.io/tx/${retirement.txn_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="View on Blockchain"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 9. Platform Analytics Panel
function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalCreditsIssued: 0,
    totalTonnesIssued: 0,
    totalTonnesRetired: 0,
    activeListings: 0,
    totalVolume: 0,
    totalUsers: 0,
    ngos: 0,
    businesses: 0,
    retirements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [credits, retirements, listings, ngos, businesses]: any = await Promise.all([
        api.getAllCredits(),
        api.getAllRetirements(),
        api.getListings(),
        api.getApprovedNgos(),
        api.getApprovedBusinesses(),
      ]);

      const totalTonnesIssued = credits.data?.reduce((sum: number, c: any) => sum + (c.co2_tonnes || 0), 0) || 0;
      const totalTonnesRetired = retirements.data?.reduce((sum: number, r: any) => sum + (r.tonnes || 0), 0) || 0;
      const totalVolume = listings.data?.filter((l: any) => l.status === 'sold')
        .reduce((sum: number, l: any) => sum + parseFloat(l.price_algo || 0), 0) || 0;

      setAnalytics({
        totalCreditsIssued: credits.data?.length || 0,
        totalTonnesIssued,
        totalTonnesRetired,
        activeListings: listings.data?.filter((l: any) => l.status === 'active').length || 0,
        totalVolume,
        totalUsers: (ngos.data?.length || 0) + (businesses.data?.length || 0),
        ngos: ngos.data?.length || 0,
        businesses: businesses.data?.length || 0,
        retirements: retirements.data?.length || 0,
      });

      // Mock monthly data - in production, query by date ranges
      setMonthlyData([
        { month: 'Jan', credits: 12, retirements: 5 },
        { month: 'Feb', credits: 19, retirements: 8 },
        { month: 'Mar', credits: 25, retirements: 12 },
        { month: 'Apr', credits: 30, retirements: 18 },
        { month: 'May', credits: 35, retirements: 22 },
        { month: 'Jun', credits: credits.data?.length || 0, retirements: retirements.data?.length || 0 },
      ]);

    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const offsetPercentage = analytics.totalTonnesIssued > 0 
    ? ((analytics.totalTonnesRetired / analytics.totalTonnesIssued) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
          <p className="text-white/50 text-sm mt-1">Comprehensive analytics and insights</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-leaf/20 to-emerald-500/10 border border-leaf/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-leaf/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm">Total Credits</p>
              <p className="text-3xl font-bold text-white">{analytics.totalCreditsIssued}</p>
            </div>
          </div>
          <p className="text-leaf/80 text-sm">{analytics.totalTonnesIssued.toLocaleString()} tonnes CO₂</p>
        </div>

        <div className="bg-gradient-to-br from-amber/20 to-amber/10 border border-amber/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm">Retired</p>
              <p className="text-3xl font-bold text-white">{analytics.retirements}</p>
            </div>
          </div>
          <p className="text-amber/80 text-sm">{analytics.totalTonnesRetired.toLocaleString()} tonnes CO₂</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm">Marketplace</p>
              <p className="text-3xl font-bold text-white">{analytics.activeListings}</p>
            </div>
          </div>
          <p className="text-blue-400/80 text-sm">{analytics.totalVolume.toFixed(2)} ALGO volume</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
            </div>
          </div>
          <p className="text-purple-400/80 text-sm">{analytics.ngos} NGOs, {analytics.businesses} Businesses</p>
        </div>
      </div>

      {/* Offset Percentage */}
      <div className="bg-gradient-to-br from-leaf/10 to-emerald-500/5 border border-leaf/20 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Platform Offset Rate</h3>
        <div className="flex items-end gap-6">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-white/70">Total Issued</span>
              <span className="text-white font-semibold">{analytics.totalTonnesIssued}t</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-leaf to-emerald-500 h-4 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="flex justify-between mb-2 mt-4">
              <span className="text-white/70">Total Retired</span>
              <span className="text-amber font-semibold">{analytics.totalTonnesRetired}t</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-amber to-orange-500 h-4 rounded-full"
                style={{ width: `${Math.min(parseFloat(offsetPercentage.toString()), 100)}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-6xl font-bold text-leaf mb-2">{offsetPercentage}%</p>
            <p className="text-white/50 text-sm">Offset Rate</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend (Simple bars) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Monthly Activity</h3>
        <div className="space-y-4">
          {monthlyData.map((month, index) => (
            <div key={month.month} className="flex items-center gap-4">
              <div className="w-12 text-white/50 text-sm">{month.month}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-leaf to-emerald-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(month.credits / 50) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{month.credits}</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/40 w-20">Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-amber to-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(month.retirements / 30) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{month.retirements}</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/40 w-20">Retired</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="mt-8 bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Environmental Impact Equivalents</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-5xl mb-3">🌳</div>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(analytics.totalTonnesRetired * 50).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Trees grown for 10 years</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">✈️</div>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(analytics.totalTonnesRetired * 4.348).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Passenger flights offset</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">🚗</div>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(analytics.totalTonnesRetired * 2500).toLocaleString()}
            </p>
            <p className="text-white/50 text-sm">Kilometers driven offset</p>
          </div>
        </div>
      </div>
    </div>
  );
}