// src/components/dashboard/ExplorerPanel.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ExplorerPanel() {
  const { walletAddress } = useWallet();
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [explorerData, setExplorerData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = searchAddress || walletAddress;
    
    if (!address) {
      toast.error('Please enter a wallet address');
      return;
    }

    setLoading(true);
    
    try {
      const response: any = await api.getPublicExplorer(address);
      setExplorerData(response.data);
    } catch (error) {
      toast.error('Failed to fetch explorer data');
    } finally {
      setLoading(false);
    }
  };

  const useMyWallet = () => {
    if (walletAddress) {
      setSearchAddress(walletAddress);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Carbon Explorer</h2>
        <p className="text-white/50 text-sm mt-1">
          View carbon offset history for any wallet address
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter wallet address..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf font-mono text-sm"
            />
            {walletAddress && (
              <button
                type="button"
                onClick={useMyWallet}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-leaf/10 text-leaf text-xs hover:bg-leaf/20"
              >
                Use My Wallet
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-leaf text-forest-dark font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {explorerData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-leaf/10 to-emerald-500/10 border border-leaf/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-white/50">Company</p>
                <h3 className="text-2xl font-bold text-white">{explorerData.company}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/50">Total Offset</p>
                <p className="text-4xl font-bold text-leaf">
                  {explorerData.totalTonnesRetired?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-white/40">tonnes CO₂</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 font-mono text-xs text-white/60 break-all">
              {explorerData.walletAddress}
            </div>
          </div>

          {/* Retirements List */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Retirement History</h4>
            {explorerData.retirements?.length > 0 ? (
              <div className="space-y-3">
                {explorerData.retirements.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{r.project}</p>
                      <p className="text-white/50 text-sm">
                        {r.verifier} • {new Date(r.retiredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber">{r.tonnes}</p>
                      <p className="text-xs text-white/40">tonnes</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={r.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
                      >
                        📄
                      </a>
                      <a
                        href={r.blockchainProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/50">No retirements found for this wallet</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}