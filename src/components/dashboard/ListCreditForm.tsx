// src/components/dashboard/ListCreditForm.tsx
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';

interface ListCreditFormProps {
  onSuccess: () => void;
}

export default function ListCreditForm({ onSuccess }: ListCreditFormProps) {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asaId: 0,
    priceAlgo: 0,
    co2Tonnes: 0,
    vintageYear: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    
    try {
      await api.createListing({
        ...formData,
        sellerWallet: walletAddress,
      });
      
      toast.success('Credit listed successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to list credit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">List a Credit for Sale</h3>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">ASA ID</label>
          <input
            type="number"
            name="asaId"
            value={formData.asaId}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Price (ALGO)</label>
          <input
            type="number"
            name="priceAlgo"
            value={formData.priceAlgo}
            onChange={handleChange}
            required
            min="0.001"
            step="0.001"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">CO₂ Tonnes</label>
          <input
            type="number"
            name="co2Tonnes"
            value={formData.co2Tonnes}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Vintage Year</label>
          <input
            type="number"
            name="vintageYear"
            value={formData.vintageYear}
            onChange={handleChange}
            required
            min="2000"
            max="2100"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-6 py-2 rounded-lg bg-leaf text-forest-dark font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
            Listing...
          </>
        ) : (
          'Create Listing'
        )}
      </button>
    </form>
  );
}