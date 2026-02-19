// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";

// Pages
import Index from "./pages/Index";
import WalletConnect from "./pages/WalletConnect";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Verify from "./pages/Verify";
import AdminDashboard from "./pages/AdminDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Smart Redirect after wallet connect
const SmartRedirect = () => {
  const { walletAddress, userData, isLoading } = useWallet();

  if (!walletAddress) return <Navigate to="/connect" replace />;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  // Not registered → go to registration
  if (!userData?.isRegistered) return <Navigate to="/register" replace />;
  
  // Pending → go to pending page
  if (userData.status === 'pending') return <Navigate to="/pending-approval" replace />;
  
  // Rejected → go to pending page (shows rejection)
  if (userData.status === 'rejected') return <Navigate to="/pending-approval" replace />;
  
  // Approved → go to appropriate dashboard
  if (userData.status === 'approved') {
    if (userData.role === 'admin') return <Navigate to="/admin" replace />;
    if (userData.role === 'ngo') return <Navigate to="/ngo" replace />;
    if (userData.role === 'business') return <Navigate to="/business" replace />;
  }

  return <Navigate to="/marketplace" replace />;
};

// Protected Route wrapper
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element; 
  allowedRoles: string[] 
}) => {
  const { walletAddress, userData, isLoading } = useWallet();
  
  if (!walletAddress) return <Navigate to="/connect" replace />;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-leaf"></div>
      </div>
    );
  }

  // Must be registered and approved
  if (!userData?.isRegistered) return <Navigate to="/register" replace />;
  if (userData.status !== 'approved') return <Navigate to="/pending-approval" replace />;
  if (!allowedRoles.includes(userData.role)) return <Navigate to="/marketplace" replace />;
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/connect" element={<WalletConnect />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/verify" element={<Verify />} />
            
            {/* Registration Flow */}
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Smart redirect after connect (backward compatibility) */}
            <Route path="/dashboard" element={<SmartRedirect />} />
            
            {/* Protected: Admin */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected: NGO */}
            <Route 
              path="/ngo/*" 
              element={
                <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                  <NgoDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected: Business */}
            <Route 
              path="/business/*" 
              element={
                <ProtectedRoute allowedRoles={['business', 'admin']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;