import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Login() {
  const { walletAddress, role, connect } = useWallet(); // <-- Changed this line
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress && role) { // <-- Changed this line
      if (role === 'admin') navigate('/admin');
      else if (role === 'ngo') navigate('/ngo');
      else if (role === 'business') navigate('/business');
      else navigate('/marketplace');
    }
  }, [walletAddress, role, navigate]); // <-- Changed this line

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-6">Carbon Marketplace</h1>
      <p className="text-gray-600 mb-8">Connect your Pera Wallet to continue</p>
      <button 
        onClick={connect}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Connect Pera Wallet
      </button>
    </div>
  );
}