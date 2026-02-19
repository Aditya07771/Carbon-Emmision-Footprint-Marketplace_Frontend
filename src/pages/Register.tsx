// src/pages/Register.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';

type RegistrationType = 'ngo' | 'business' | null;

const countries = [
  'India', 'United States', 'United Kingdom', 'Germany', 'France', 
  'Brazil', 'Australia', 'Canada', 'Japan', 'Singapore', 'Other'
];

const ngoTypes = [
  'Environmental Conservation', 'Reforestation', 'Renewable Energy',
  'Ocean Conservation', 'Wildlife Protection', 'Community Development', 'Other'
];

const industries = [
  'Technology', 'Manufacturing', 'Finance', 'Healthcare', 'Retail',
  'Transportation', 'Energy', 'Agriculture', 'Construction', 'Other'
];

const employeeCounts = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function Register() {
  const navigate = useNavigate();
  const { walletAddress, refreshUserData } = useWallet();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Common fields
  const [commonData, setCommonData] = useState({
    organizationName: '',
    email: '',
    phone: '',
    country: '',
    website: '',
    description: ''
  });

  // NGO specific fields
  const [ngoData, setNgoData] = useState({
    registrationNumber: '',
    ngoType: '',
    operatingRegions: [] as string[],
    certifications: [] as string[]
  });

  // Business specific fields
  const [businessData, setBusinessData] = useState({
    companyType: '',
    industry: '',
    employeeCount: '',
    sustainabilityGoals: ''
  });

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCommonData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNgoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNgoData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBusinessData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return toast.error('Please connect your wallet');
    
    setLoading(true);
    try {
      if (registrationType === 'ngo') {
        await api.registerNgo({
          walletAddress,
          ...commonData,
          ...ngoData
        });
      } else {
        await api.registerBusiness({
          walletAddress,
          ...commonData,
          ...businessData
        });
      }

      toast.success('Registration submitted! Awaiting admin approval.');
      await refreshUserData();
      navigate('/pending-approval');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Not Connected</h2>
          <p className="text-white/60 mb-6">Please connect your wallet to register</p>
          <button
            onClick={() => navigate('/connect')}
            className="px-6 py-3 rounded-xl bg-leaf text-forest-dark font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-dark py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Join CarbonChain
          </h1>
          <p className="text-white/60">
            Register your organization to start trading carbon credits
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-leaf animate-pulse"></span>
            <span className="text-sm text-white/70 font-mono">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </span>
          </div>
        </motion.div>

        {/* Type Selection */}
        <AnimatePresence mode="wait">
          {!registrationType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* NGO Card */}
              <button
                onClick={() => setRegistrationType('ngo')}
                className="group p-8 rounded-2xl bg-gradient-to-br from-leaf/10 to-emerald-500/5 border border-leaf/20 text-left hover:border-leaf/50 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-leaf/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Register as NGO</h3>
                <p className="text-white/60 text-sm mb-4">
                  Issue verified carbon credits from your environmental projects
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Issue carbon credits
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    List on marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Track project impact
                  </li>
                </ul>
              </button>

              {/* Business Card */}
              <button
                onClick={() => setRegistrationType('business')}
                className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 text-left hover:border-blue-500/50 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Register as Business</h3>
                <p className="text-white/60 text-sm mb-4">
                  Purchase and retire carbon credits to offset your emissions
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Buy verified credits
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Retire & get certificates
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Public sustainability profile
                  </li>
                </ul>
              </button>
            </motion.div>
          )}

          {/* Registration Form */}
          {registrationType && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setRegistrationType(null);
                  setStep(1);
                }}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to selection
              </button>

              {/* Form Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  registrationType === 'ngo' ? 'bg-leaf/20' : 'bg-blue-500/20'
                }`}>
                  {registrationType === 'ngo' ? (
                    <svg className="w-6 h-6 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {registrationType === 'ngo' ? 'NGO Registration' : 'Business Registration'}
                  </h2>
                  <p className="text-white/50 text-sm">Fill in your organization details</p>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-8">
                <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-leaf' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-leaf' : 'bg-white/10'}`} />
              </div>

              {/* Step 1: Common Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={commonData.organizationName}
                        onChange={handleCommonChange}
                        required
                        placeholder="e.g. Green Earth Foundation"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={commonData.email}
                        onChange={handleCommonChange}
                        required
                        placeholder="contact@organization.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={commonData.phone}
                        onChange={handleCommonChange}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={commonData.country}
                        onChange={handleCommonChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                      >
                        <option value="" className="bg-forest-dark">Select country</option>
                        {countries.map(c => (
                          <option key={c} value={c} className="bg-forest-dark">{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={commonData.website}
                        onChange={handleCommonChange}
                        placeholder="https://yourorganization.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={commonData.description}
                      onChange={handleCommonChange}
                      required
                      rows={3}
                      placeholder="Tell us about your organization and its mission..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!commonData.organizationName || !commonData.email || !commonData.country || !commonData.description}
                    className="w-full py-3 rounded-xl bg-leaf text-forest-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-leaf/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Role-specific Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {registrationType === 'ngo' ? 'NGO Details' : 'Business Details'}
                  </h3>

                  {registrationType === 'ngo' ? (
                    // NGO Fields
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Registration Number *
                          </label>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={ngoData.registrationNumber}
                            onChange={handleNgoChange}
                            required
                            placeholder="e.g. NGO-12345"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            NGO Type *
                          </label>
                          <select
                            name="ngoType"
                            value={ngoData.ngoType}
                            onChange={handleNgoChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                          >
                            <option value="" className="bg-forest-dark">Select type</option>
                            {ngoTypes.map(t => (
                              <option key={t} value={t} className="bg-forest-dark">{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-leaf/5 border border-leaf/20">
                        <p className="text-sm text-leaf/80">
                          <strong>Note:</strong> After approval, you'll be able to issue verified carbon credits from your environmental projects.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Business Fields
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Company Type *
                          </label>
                          <select
                            name="companyType"
                            value={businessData.companyType}
                            onChange={handleBusinessChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                          >
                            <option value="" className="bg-forest-dark">Select type</option>
                            <option value="corporation" className="bg-forest-dark">Corporation</option>
                            <option value="sme" className="bg-forest-dark">SME</option>
                            <option value="startup" className="bg-forest-dark">Startup</option>
                            <option value="nonprofit" className="bg-forest-dark">Non-Profit</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Industry *
                          </label>
                          <select
                            name="industry"
                            value={businessData.industry}
                            onChange={handleBusinessChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                          >
                            <option value="" className="bg-forest-dark">Select industry</option>
                            {industries.map(i => (
                              <option key={i} value={i} className="bg-forest-dark">{i}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            Employee Count
                          </label>
                          <select
                            name="employeeCount"
                            value={businessData.employeeCount}
                            onChange={handleBusinessChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                          >
                            <option value="" className="bg-forest-dark">Select range</option>
                            {employeeCounts.map(e => (
                              <option key={e} value={e} className="bg-forest-dark">{e}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Sustainability Goals
                        </label>
                        <textarea
                          name="sustainabilityGoals"
                          value={businessData.sustainabilityGoals}
                          onChange={handleBusinessChange}
                          rows={3}
                          placeholder="Describe your company's sustainability objectives..."
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf resize-none"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-sm text-blue-400/80">
                          <strong>Note:</strong> After approval, you'll be able to purchase and retire carbon credits to offset your emissions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (registrationType === 'ngo' ? !ngoData.registrationNumber || !ngoData.ngoType : !businessData.companyType || !businessData.industry)}
                      className="flex-1 py-3 rounded-xl bg-leaf text-forest-dark font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-leaf/90 transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Registration'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}