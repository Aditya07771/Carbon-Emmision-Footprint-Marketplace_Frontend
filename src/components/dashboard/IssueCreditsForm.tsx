// src/components/dashboard/IssueCreditsForm.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import algosdk from 'algosdk';

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

const projectTypes = ['Reforestation', 'Solar', 'Wind', 'Biogas', 'Methane Capture', 'Ocean Conservation', 'Other'];

export default function IssueCreditsForm() {
  const { walletAddress, signTransactions } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, metadata, files

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Basic Algorand Info
    projectId: '',
    name: '',
    projectType: 'Reforestation',
    co2Tonnes: 0,
    vintageYear: new Date().getFullYear(),
    
    // IPFS Detailed Metadata
    description: '',
    location: '',
    coordinates: '',
    standard: '', // Verra, Gold Standard, etc.
    methodology: '',
    registryId: '',
    
    // Impact
    sdgGoals: '',
    impactStats: '',
    
    // NGO Details
    ngoName: '',
    ngoContact: '',
    ngoWebsite: '',
  });

  // File States
  const [files, setFiles] = useState({
    mainPhoto: null as File | null,
    satelliteImages: null as File | null,
    groundPhotos: null as File | null,
    ngoLogo: null as File | null,
    verificationReport: null as File | null,
    projectDesignDocument: null as File | null,
    monitoringReport: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return toast.error('Please connect your wallet');
    setLoading(true);
    
    try {
      // 1. Prepare FormData for IPFS Upload
      toast.loading("Uploading metadata & files to Pinata (IPFS)...", { id: 'process' });
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, String(value)));
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      // NOTE: Your backend must have the POST /api/ipfs/upload endpoint implemented to catch this and return { ipfsHash }
      // Mocking the IPFS Hash retrieval for the frontend logic flow:
      // const { ipfsHash } = await api.uploadToIPFS(payload); 
      const mockIpfsHash = "QmYourPinataHashGoesHere123456789"; 
      
      // 2. Mint ASA on Algorand with the Pinata IPFS Hash
      toast.loading("Minting Carbon Credit ASA on Algorand...", { id: 'process' });
      const params = await algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: walletAddress,
        total: Number(formData.co2Tonnes), // 1 Unit = 1 Tonne of CO2
        decimals: 0,
        defaultFrozen: false,
        manager: walletAddress,
        reserve: walletAddress,
        freeze: walletAddress,
        clawback: walletAddress,
        unitName: "CO2C",
        assetName: formData.name.substring(0, 32),
        assetURL: `ipfs://${mockIpfsHash}`, // Embedding IPFS proof directly into the blockchain asset
        suggestedParams: params,
      });

      const signedTxns = await signTransactions([[txn.toByte()]]);
      const response = await algodClient.sendRawTransaction(signedTxns[0]).do();
      const txId = response['txId'];
      
      toast.loading("Waiting for blockchain confirmation...", { id: 'process' });
      const pendingInfo = await algosdk.waitForConfirmation(algodClient, txId, 4);
      const newAsaId = pendingInfo['asset-index'];

      // 3. Save everything to Backend DB
      toast.loading("Finalizing project in database...", { id: 'process' });
      await api.issueCredits({
        ...formData,
        asaId: newAsaId,
        ipfsHash: mockIpfsHash,
        issuerWallet: walletAddress,
      });
      
      toast.success(`Credits Minted Successfully! ASA ID: ${newAsaId}`, { id: 'process' });
      
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to issue credits', { id: 'process' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Issue Verified Carbon Credits</h2>
          <p className="text-white/50 text-sm mt-1">Mint assets mapped directly to Pinata IPFS metadata.</p>
        </div>
        
        {/* Step Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-lg">
          {['details', 'metadata', 'files'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-leaf text-forest-dark' : 'text-white/70 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        
        {/* TAB 1: BASIC DETAILS */}
        {activeTab === 'details' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project ID (Registry)</label>
              <input type="text" name="projectId" value={formData.projectId} onChange={handleChange} required placeholder="e.g. VCS-1234" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Amazon Reforestation" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project Type</label>
              <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                {projectTypes.map(type => <option key={type} value={type} className="bg-forest-dark">{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">CO₂ Tonnes to Mint</label>
              <input type="number" name="co2Tonnes" value={formData.co2Tonnes} onChange={handleChange} required min="1" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Vintage Year</label>
              <input type="number" name="vintageYear" value={formData.vintageYear} onChange={handleChange} required min="1990" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Verification Standard</label>
              <input type="text" name="standard" value={formData.standard} onChange={handleChange} placeholder="Verra, Gold Standard..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
          </div>
        )}

        {/* TAB 2: IPFS METADATA */}
        {activeTab === 'metadata' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Full Project Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Location & Coordinates</label>
              <input type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} placeholder="Lat: -3.4653, Long: -62.2159" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Methodology Applied</label>
              <input type="text" name="methodology" value={formData.methodology} onChange={handleChange} placeholder="e.g. VM0015" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">SDG Goals Met (Comma separated)</label>
              <input type="text" name="sdgGoals" value={formData.sdgGoals} onChange={handleChange} placeholder="SDG 13, SDG 15" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">NGO / Issuer Name</label>
              <input type="text" name="ngoName" value={formData.ngoName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" />
            </div>
          </div>
        )}

        {/* TAB 3: FILE UPLOADS (PINATA) */}
        {activeTab === 'files' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="text-leaf font-semibold mb-3">Project Documents (PDF)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Verification Report</label>
                    <input type="file" name="verificationReport" accept=".pdf" onChange={handleFileChange} className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Project Design Doc</label>
                    <input type="file" name="projectDesignDocument" accept=".pdf" onChange={handleFileChange} className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="text-leaf font-semibold mb-3">Project Imagery</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Main Cover Photo</label>
                    <input type="file" name="mainPhoto" accept="image/*" onChange={handleFileChange} className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Satellite Before/After</label>
                    <input type="file" name="satelliteImages" accept="image/*" onChange={handleFileChange} className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-leaf/20 transition-all">
              {loading ? 'Uploading & Minting...' : 'Upload to IPFS & Mint Asset'}
            </button>
          </div>
        )}
      </motion.form>
    </div>
  );
}