// src/components/dashboard/RetireCreditsForm.tsx
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface RetireCreditsFormProps {
  onSuccess: () => void;
}

export default function RetireCreditsForm({ onSuccess }: RetireCreditsFormProps) {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asaId: 0,
    tonnes: 0,
    companyName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    
    try {
      // In production, you would sign a retirement transaction
      const mockTxnHash = `RETIRE_${Date.now()}`;
      const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
      
      await api.retireCredits({
        txnHash: mockTxnHash,
        companyWallet: walletAddress,
        companyName: formData.companyName,
        asaId: formData.asaId,
        tonnes: formData.tonnes,
        certificateId,
      });
      
      toast.success(`Credits retired! Certificate ID: ${certificateId}`);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retire credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-amber/5 border border-amber/20 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Retire Carbon Credits</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">ASA ID</label>
          <input
            type="number"
            value={formData.asaId}
            onChange={(e) => setFormData(prev => ({ ...prev, asaId: Number(e.target.value) }))}
            required
            min="1"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Tonnes to Retire</label>
          <input
            type="number"
            value={formData.tonnes}
            onChange={(e) => setFormData(prev => ({ ...prev, tonnes: Number(e.target.value) }))}
            required
            min="1"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Company Name</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            required
            placeholder="Your Company"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-amber"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-6 py-2 rounded-lg bg-amber text-forest-dark font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? 'Retiring...' : 'Retire Credits'}
      </button>
    </form>
  );
}