// src/pages/WalletConnect.tsx
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WalletConnect() {
  const { connect, isConnected, isConnecting } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest-dark via-forest-dark to-emerald-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-amber/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-leaf">
                <path 
                  d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 10-10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M2 2s7 2 10 9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">CarbonChain</h1>
                <p className="text-xs text-white/50">Carbon Credit Marketplace</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-white/60 text-sm">
              Connect your Pera Wallet to access the carbon credit dashboard
            </p>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-semibold text-lg transition-all hover:shadow-lg hover:shadow-leaf/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
                Connect with Pera Wallet
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-white/80 text-sm">
                  Don't have Pera Wallet?
                </p>
                <a 
                  href="https://perawallet.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-leaf text-sm hover:underline"
                >
                  Download it here →
                </a>
              </div>
            </div>
          </div>

          {/* Network Badge */}
          <div className="mt-6 flex justify-center">
            <span className="px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
              Algorand TestNet
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}