// src/components/dashboard/DashboardLayout.tsx
import { ReactNode, useState } from 'react';
// import Sidebar from './Sidebar';
import { useWallet } from '@/context/WalletContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export default function DashboardLayout({ 
  children, 
  activePanel, 
  onPanelChange 
}: DashboardLayoutProps) {
  const { walletAddress, disconnect } = useWallet();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDisconnect = () => {
    disconnect();
    navigate('/connect');
  };

  const truncateAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-forest-dark flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        activePanel={activePanel}
        onPanelChange={onPanelChange}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* Network Status */}
            <span className="px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
              TestNet
            </span>

            {/* Wallet */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/50">Connected</p>
                <p className="text-sm text-white font-mono">
                  {walletAddress ? truncateAddress(walletAddress) : '---'}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Disconnect"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}