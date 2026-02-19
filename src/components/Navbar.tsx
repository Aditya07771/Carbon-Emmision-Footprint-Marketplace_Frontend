// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";

const navLinks = ["How It Works", "For NGOs", "Marketplace", "Verify Credit", "About"];

const LeafIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-leaf transition-transform duration-700 group-hover:rotate-[360deg]">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 2s7 2 10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const { walletAddress, isConnected, isConnecting, connect, disconnect } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the dashboard
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showWalletMenu && !(e.target as Element).closest('.wallet-menu-container')) {
        setShowWalletMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showWalletMenu]);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
      // Navigate to dashboard after successful connection
      navigate('/dashboard');
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
    toast.success('Wallet disconnected');
    // Navigate to home if on dashboard
    if (isDashboard) {
      navigate('/');
    }
  };

  const handleGoToDashboard = () => {
    setShowWalletMenu(false);
    navigate('/dashboard');
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isDashboard
          ? "bg-forest-dark/85 backdrop-blur-xl border-b border-leaf/10"
          : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => navigate('/')}
          >
            <LeafIcon />
            <div>
              <span className="font-display text-xl font-bold text-text-light">CarbonChain</span>
              <p className="font-mono text-[10px] text-muted-foreground leading-none">Built on Algorand</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {!isDashboard && navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="font-body text-sm text-text-light/70 hover:text-leaf transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-leaf after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link}
              </a>
            ))}
            {isDashboard && (
              <button
                onClick={() => navigate('/')}
                className="font-body text-sm text-text-light/70 hover:text-leaf transition-colors"
              >
                ← Back to Home
              </button>
            )}
          </div>

          {/* Right side - Wallet Connection */}
          <div className="hidden lg:flex items-center gap-4">
            {isConnected && walletAddress ? (
              // Connected State
              <div className="relative wallet-menu-container">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-leaf/10 border border-leaf/30 hover:bg-leaf/20 transition-all"
                >
                  {/* Connection indicator */}
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
                    <span className="font-mono text-sm text-leaf">
                      {truncateAddress(walletAddress)}
                    </span>
                  </span>
                  {/* Dropdown arrow */}
                  <svg
                    className={`w-4 h-4 text-leaf transition-transform ${showWalletMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showWalletMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-forest-dark/95 backdrop-blur-xl border border-leaf/20 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {/* Wallet Info */}
                      <div className="p-4 border-b border-leaf/10">
                        <p className="text-xs text-white/50 mb-1">Connected Wallet</p>
                        <p className="font-mono text-sm text-white break-all">
                          {walletAddress}
                        </p>
                      </div>

                      {/* Network Badge */}
                      <div className="px-4 py-3 border-b border-leaf/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-leaf" />
                          <span className="text-xs text-white/70">Algorand TestNet</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleGoToDashboard}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-leaf/10 hover:text-leaf transition-colors text-left"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Dashboard
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(walletAddress);
                            toast.success('Address copied to clipboard');
                            setShowWalletMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-leaf/10 hover:text-leaf transition-colors text-left"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Address
                        </button>

                        <a
                          href={`https://testnet.algoexplorer.io/address/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowWalletMenu(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-leaf/10 hover:text-leaf transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View on Explorer
                        </a>

                        <hr className="my-2 border-leaf/10" />

                        <button
                          onClick={handleDisconnect}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Not Connected State
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="relative px-5 py-2.5 rounded-full font-body text-sm font-medium text-text-light pulse-ring disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "hsl(var(--forest-dark))",
                  border: "1.5px solid transparent",
                  backgroundClip: "padding-box",
                  boxShadow: "inset 0 0 0 0 hsl(var(--leaf-green))",
                }}
              >
                <span className="absolute inset-0 rounded-full" style={{
                  background: "linear-gradient(135deg, hsl(var(--leaf-green)), hsl(var(--amber-gold)))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1.5px",
                  borderRadius: "9999px",
                }} />
                <span className="flex items-center gap-2">
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-leaf">
                        <polygon points="12,2 22,22 2,22" />
                      </svg>
                      Connect Wallet
                    </>
                  )}
                </span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-text-light p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <motion.div animate={mobileOpen ? "open" : "closed"}>
              <svg width="24" height="24" viewBox="0 0 24 24" className="stroke-current" strokeWidth="2" fill="none">
                <motion.line x1="3" y1="6" x2="21" y2="6" variants={{ open: { y1: 12, y2: 12, rotate: 45, originX: "50%", originY: "50%" }, closed: { y1: 6, y2: 6, rotate: 0 } }} transition={{ duration: 0.3 }} />
                <motion.line x1="3" y1="12" x2="21" y2="12" variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }} transition={{ duration: 0.2 }} />
                <motion.line x1="3" y1="18" x2="21" y2="18" variants={{ open: { y1: 12, y2: 12, rotate: -45, originX: "50%", originY: "50%" }, closed: { y1: 18, y2: 18, rotate: 0 } }} transition={{ duration: 0.3 }} />
              </svg>
            </motion.div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-forest-dark/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 lg:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Connected wallet info (mobile) */}
            {isConnected && walletAddress && (
              <div className="px-6 py-4 rounded-xl bg-leaf/10 border border-leaf/30 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
                  <span className="text-xs text-white/50">Connected</span>
                </div>
                <p className="font-mono text-sm text-leaf">{truncateAddress(walletAddress)}</p>
              </div>
            )}

            {/* Navigation links */}
            {!isDashboard && navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="font-display text-2xl text-text-light hover:text-leaf transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}

            {isDashboard && (
              <button
                onClick={() => {
                  navigate('/');
                  setMobileOpen(false);
                }}
                className="font-display text-2xl text-text-light hover:text-leaf transition-colors"
              >
                ← Back to Home
              </button>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-4">
              {isConnected ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileOpen(false);
                    }}
                    className="px-8 py-3 rounded-full bg-leaf text-forest-dark font-body font-semibold"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setMobileOpen(false);
                    }}
                    className="px-8 py-3 rounded-full border border-red-400/30 text-red-400 font-body font-medium"
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleConnect();
                    setMobileOpen(false);
                  }}
                  disabled={isConnecting}
                  className="px-8 py-3 rounded-full bg-leaf text-forest-dark font-body font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}