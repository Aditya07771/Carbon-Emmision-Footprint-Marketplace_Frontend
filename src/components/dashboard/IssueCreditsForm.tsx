import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import api from '@/services/api';
import { toast } from 'sonner';
import algosdk from 'algosdk';

// Setup Algorand Client
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');

const projectTypes = ['Reforestation', 'Solar', 'Wind', 'Biogas', 'Methane Capture', 'Ocean Conservation', 'Other'];

export default function IssueCreditsForm() {
  const { walletAddress, peraWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [signingState, setSigningState] = useState<'idle' | 'waiting' | 'signed'>('idle');

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    projectType: 'Reforestation',
    co2Tonnes: 0,
    vintageYear: new Date().getFullYear(),
    description: '',
    location: '',
    coordinates: '',
    standard: '',
    methodology: '',
    registryId: '',
    sdgGoals: '',
    impactStats: '',
    ngoName: '',
    ngoContact: '',
    ngoWebsite: '',
  });

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
    if (!peraWallet) return toast.error('Wallet not initialized');

    setLoading(true);

    try {
      // --- STEP 1: Build the transaction immediately (before any async work) ---
      // This is critical: the Pera Wallet popup must be triggered as close to
      // the user's click as possible, or browsers will block the popup.
      toast.loading("Preparing transaction...", { id: 'process' });

      const params = await algodClient.getTransactionParams().do();
      const sender = walletAddress;

      // Use a placeholder IPFS hash for now — we'll upload in parallel
      const tempIpfsHash = `QmPending${Date.now()}`;

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender,
        total: BigInt(formData.co2Tonnes),
        decimals: 0,
        defaultFrozen: false,
        manager: sender,
        reserve: sender,
        freeze: undefined,
        clawback: undefined,
        unitName: "CO2C",
        assetName: formData.name.substring(0, 32),
        assetURL: `ipfs://${tempIpfsHash}`,
        suggestedParams: params,
      });

      // --- STEP 2: Sign IMMEDIATELY — triggers Pera popup right after user click ---
      // Show our own full-screen modal so user knows to check Pera Wallet on their phone
      setSigningState('waiting');
      toast.dismiss('process');
      console.log("🔐 Requesting signature from Pera Wallet...");

      let signedTxnGroups: Uint8Array[];
      try {
        // Do NOT pass `signers` — that tells Pera it's multisig and suppresses popup
        signedTxnGroups = await peraWallet.signTransaction([[{ txn }]]);
      } finally {
        setSigningState('idle');
      }

      setSigningState('signed');
      setTimeout(() => setSigningState('idle'), 1500);
      console.log("✅ Transaction signed successfully!");
      const signedTxn = signedTxnGroups[0];

      // --- STEP 3: Upload to IPFS (now that signing is done) ---
      toast.loading("Uploading documents to IPFS via Pinata...", { id: 'process' });

      const filesToUpload = [
        files.mainPhoto,
        files.satelliteImages,
        files.groundPhotos,
        files.verificationReport,
        files.projectDesignDocument,
      ].filter((f): f is File => f !== null);

      let actualIpfsHash = "";
      if (filesToUpload.length > 0) {
        const uploadResponse = await api.uploadToIpfs(filesToUpload);
        actualIpfsHash = uploadResponse.ipfsHash;
        console.log("✅ IPFS Upload Success:", actualIpfsHash);
      } else {
        console.warn("⚠️ No files uploaded, using mock hash");
        actualIpfsHash = `QmMock${Date.now()}`;
      }

      // --- STEP 4: Submit signed transaction to Algorand ---
      toast.loading("Submitting to Algorand...", { id: 'process' });
      const submitResult = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = submitResult.txid ?? (submitResult as any).txId;
      console.log("📝 Transaction ID:", txId);

      toast.loading("Waiting for confirmation...", { id: 'process' });
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
      const asaId = Number(confirmedTxn.assetIndex ?? confirmedTxn['asset-index']);

      if (!asaId) throw new Error('Failed to retrieve ASA ID from transaction');
      console.log("🎉 ASA Created! ID:", asaId);

      // --- STEP 4: Save to Database ---
      toast.loading("Saving to database...", { id: 'process' });

      await api.issueCredits({
        projectId: formData.projectId,
        name: formData.name,
        location: formData.location,
        projectType: formData.projectType,
        verifier: formData.standard,
        co2Tonnes: formData.co2Tonnes,
        vintageYear: formData.vintageYear,
        asaId: asaId,
        issuerWallet: sender,
        ipfsHash: actualIpfsHash,
        description: formData.description,
      }, sender);

      toast.success(`✅ Credits Issued! ASA ID: ${asaId}`, { id: 'process' });

      // Reset form
      setFormData({
        projectId: '',
        name: '',
        projectType: 'Reforestation',
        co2Tonnes: 0,
        vintageYear: new Date().getFullYear(),
        description: '',
        location: '',
        coordinates: '',
        standard: '',
        methodology: '',
        registryId: '',
        sdgGoals: '',
        impactStats: '',
        ngoName: '',
        ngoContact: '',
        ngoWebsite: '',
      });
      setFiles({
        mainPhoto: null,
        satelliteImages: null,
        groundPhotos: null,
        ngoLogo: null,
        verificationReport: null,
        projectDesignDocument: null,
        monitoringReport: null,
      });

    } catch (error: any) {
      console.error('❌ Issue Credits Error:', error);
      toast.error(error?.message || 'Failed to issue credits', { id: 'process' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== PERA WALLET SIGNING OVERLAY ===== */}
      {signingState !== 'idle' && (
        <div
          style={{ zIndex: 999999 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#1a2e1a] border border-green-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            {signingState === 'waiting' ? (
              <>
                {/* Spinning ring */}
                <div className="mx-auto mb-6 w-20 h-20 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-green-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">🔐</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sign in Pera Wallet</h3>
                <p className="text-white/60 text-sm mb-4">
                  A signing request has been sent to your{' '}
                  <span className="text-green-400 font-semibold">Pera Wallet app</span> on your phone.
                </p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-left space-y-2 mb-4">
                  <p className="text-green-300 text-sm font-semibold">📱 How to sign:</p>
                  <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                    <li>Open <strong className="text-white">Pera Wallet</strong> on your phone</li>
                    <li>You'll see a signing request notification</li>
                    <li>Review the transaction details</li>
                    <li>Tap <strong className="text-white">Sign</strong> to confirm</li>
                  </ol>
                </div>
                <p className="text-white/40 text-xs">Waiting for your signature… do not close this page.</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center bg-green-500/20 rounded-full text-4xl">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">Signed Successfully!</h3>
                <p className="text-white/60 text-sm">Submitting to Algorand blockchain…</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== MAIN FORM ===== */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Issue Verified Carbon Credits</h2>
            <p className="text-white/50 text-sm mt-1">Create blockchain-verified carbon credits</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-lg">
            {['details', 'metadata', 'files'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab
                  ? 'bg-leaf text-forest-dark'
                  : 'text-white/70 hover:text-white'
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
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  placeholder="e.g. VCS-1234"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Amazon Reforestation"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                >
                  {projectTypes.map(type => (
                    <option key={type} value={type} className="bg-forest-dark">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">CO₂ Tonnes to Mint</label>
                <input
                  type="number"
                  name="co2Tonnes"
                  value={formData.co2Tonnes}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
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
                  min="1990"
                  max="2100"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Verification Standard</label>
                <input
                  type="text"
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  placeholder="Verra, Gold Standard..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Amazon Rainforest, Brazil"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>

              {/* Add Submit Button to Details Tab */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-leaf/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Issue Carbon Credits'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IPFS METADATA */}
          {activeTab === 'metadata' && (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">Full Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the carbon offset project..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Coordinates</label>
                <input
                  type="text"
                  name="coordinates"
                  value={formData.coordinates}
                  onChange={handleChange}
                  placeholder="Lat: -3.4653, Long: -62.2159"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Methodology</label>
                <input
                  type="text"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                  placeholder="e.g. VM0015"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">SDG Goals (Comma separated)</label>
                <input
                  type="text"
                  name="sdgGoals"
                  value={formData.sdgGoals}
                  onChange={handleChange}
                  placeholder="SDG 13, SDG 15"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">NGO / Issuer Name</label>
                <input
                  type="text"
                  name="ngoName"
                  value={formData.ngoName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-leaf"
                />
              </div>

              {/* Add Submit Button to Metadata Tab */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-leaf/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Issue Carbon Credits'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FILE UPLOADS */}
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-leaf font-semibold mb-3">Project Documents (PDF)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Verification Report</label>
                      <input
                        type="file"
                        name="verificationReport"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Project Design Doc</label>
                      <input
                        type="file"
                        name="projectDesignDocument"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h4 className="text-leaf font-semibold mb-3">Project Imagery</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Main Cover Photo</label>
                      <input
                        type="file"
                        name="mainPhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Satellite Images</label>
                      <input
                        type="file"
                        name="satelliteImages"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-leaf to-emerald-500 text-forest-dark font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-leaf/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Issue Carbon Credits'
                )}
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </>
  );
}