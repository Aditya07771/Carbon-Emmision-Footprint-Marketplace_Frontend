// src/pages/PendingApproval.tsx

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useEffect } from 'react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { walletAddress, userData, refreshUserData, disconnect } = useWallet();

  useEffect(() => {
    // Redirect if already approved
    if (userData?.status === 'approved') {
      const dashboard = userData.role === 'ngo' ? '/ngo' : '/business';
      navigate(dashboard);
    }
  }, [userData, navigate]);

  const handleRefresh = async () => {
    await refreshUserData();
  };

  if (userData?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Registration Rejected</h1>
          <p className="text-white/60 mb-4">
            Unfortunately, your registration was not approved.
          </p>
          
          {userData.rejectionReason && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-white/40 mb-1">Reason:</p>
              <p className="text-white/80 text-sm">{userData.rejectionReason}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => {
                disconnect();
                navigate('/register');
              }}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              Try Again with Different Details
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full py-3 rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
            >
              Browse Marketplace as Guest
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
      >
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-amber/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-amber/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Pending Approval
        </h1>
        <p className="text-white/60 mb-6">
          Your registration is being reviewed by our team. This usually takes 24-48 hours.
        </p>

        {/* Status Card */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-sm">Organization</span>
            <span className="text-white font-medium">{userData?.organizationName || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-sm">Type</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              userData?.role === 'ngo' 
                ? 'bg-leaf/20 text-leaf' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {userData?.role?.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm">Status</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber/20 text-amber">
              PENDING
            </span>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="text-xs text-white/40 font-mono mb-6 truncate">
          {walletAddress}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full py-3 rounded-xl bg-leaf text-forest-dark font-medium flex items-center justify-center gap-2 hover:bg-leaf/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Check Status
          </button>
          
          <button
            onClick={() => navigate('/marketplace')}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-xs text-white/40">
          Questions? Contact support@carbonchain.io
        </p>
      </motion.div>
    </div>
  );
}