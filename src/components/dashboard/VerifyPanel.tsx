// src/components/dashboard/VerifyPanel.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { toast } from 'sonner';

export default function VerifyPanel() {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response: any = await api.verifyCertificate(certificateId);
      setResult(response.data);
      toast.success('Certificate found and verified!');
    } catch (error) {
      setResult(null);
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Verify Certificate</h2>
        <p className="text-white/50 text-sm mt-1">
          Enter a certificate ID to verify its authenticity on the blockchain
        </p>
      </div>

      <form onSubmit={handleVerify} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="e.g., CERT-ABC12345"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-leaf text-forest-dark font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Verify
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-leaf/5 border border-leaf/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-leaf/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Certificate Verified</h3>
              <p className="text-white/50 text-sm">This retirement is authentic and recorded on Algorand</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/50 mb-1">Certificate ID</p>
              <p className="text-white font-mono">{result.certificate_id}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/50 mb-1">Company</p>
              <p className="text-white">{result.company?.name || 'Unknown'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/50 mb-1">CO₂ Retired</p>
              <p className="text-white font-bold text-xl">{result.tonnes} tonnes</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/50 mb-1">Retired At</p>
              <p className="text-white">{new Date(result.retired_at).toLocaleDateString()}</p>
            </div>
          </div>

          {result.project && (
            <div className="mt-4 p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/50 mb-2">Project Details</p>
              <p className="text-white font-medium">{result.project.name}</p>
              <p className="text-white/60 text-sm">
                {result.project.project_type} • Verified by {result.project.verifier}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <a
              href={result.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center hover:bg-white/10 transition-colors"
            >
              View on IPFS
            </a>
            <a
              href={`https://testnet.algoexplorer.io/tx/${result.txn_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-leaf/10 border border-leaf/20 text-leaf text-center hover:bg-leaf/20 transition-colors"
            >
              View on Blockchain
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}