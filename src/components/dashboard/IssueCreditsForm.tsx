// src/components/dashboard/IssueCreditsForm.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';

const projectTypes = [
  'Reforestation',
  'Solar',
  'Wind',
  'Biogas',
  'Methane Capture',
  'Ocean Conservation',
  'Other'
];

export default function IssueCreditsForm() {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    location: '',
    projectType: 'Reforestation',
    verifier: '',
    co2Tonnes: 0,
    vintageYear: new Date().getFullYear(),
    asaId: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.issueCredits({
        ...formData,
        issuerWallet: walletAddress,
      });
      
      toast.success('Carbon credits issued successfully!');
      console.log('Issued:', response);
      
      // Reset form
      setFormData({
        projectId: '',
        name: '',
        location: '',
        projectType: 'Reforestation',
        verifier: '',
        co2Tonnes: 0,
        vintageYear: new Date().getFullYear(),
        asaId: 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to issue credits');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Issue Carbon Credits</h2>
        <p className="text-white/50 text-sm mt-1">
          Create new carbon credits backed by verified environmental projects
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project ID */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Project ID
            </label>
            <input
              type="text"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              placeholder="e.g., VCS-1234"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Amazon Rainforest Protection"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Brazil, South America"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Project Type
            </label>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf transition-colors"
            >
              {projectTypes.map(type => (
                <option key={type} value={type} className="bg-forest-dark">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Verifier */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Verifier
            </label>
            <input
              type="text"
              name="verifier"
              value={formData.verifier}
              onChange={handleChange}
              required
              placeholder="Verra, Gold Standard, etc."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* CO2 Tonnes */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              CO₂ Tonnes
            </label>
            <input
              type="number"
              name="co2Tonnes"
              value={formData.co2Tonnes}
              onChange={handleChange}
              required
              min="1"
              placeholder="1000"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* Vintage Year */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Vintage Year
            </label>
            <input
              type="number"
              name="vintageYear"
              value={formData.vintageYear}
              onChange={handleChange}
              required
              min="2000"
              max="2100"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>

          {/* ASA ID */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              ASA ID (Algorand Asset)
            </label>
            <input
              type="number"
              name="asaId"
              value={formData.asaId}
              onChange={handleChange}
              required
              min="1"
              placeholder="123456789"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-semibold text-lg transition-all hover:shadow-lg hover:shadow-leaf/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Issuing Credits...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Issue Carbon Credits
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}