// src/context/WalletContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import api from '@/services/api';

interface UserData {
  role: string;
  status: string;
  isRegistered: boolean;
  organizationName?: string;
  rejectionReason?: string;
  sustainabilityGoals?: string;
}

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  peraWallet: PeraWalletConnect | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransactions: (txnGroups: any[][]) => Promise<Uint8Array[]>;
  // User data
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: false, // We handle signing UI ourselves with a custom modal
  chainId: 416002,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = async (address: string) => {
    setIsLoading(true);
    try {
      const response = await api.getUserRole(address);
      setUserData({
        role: response.role,
        status: response.status,
        isRegistered: response.isRegistered,
        organizationName: response.organizationName,
        rejectionReason: response.rejectionReason
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({
        role: 'public',
        status: 'none',
        isRegistered: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (walletAddress) {
      await fetchUserData(walletAddress);
    }
  };

  useEffect(() => {
    peraWallet.reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchUserData(accounts[0]);
        }
      })
      .catch(console.error);

    peraWallet.connector?.on('disconnect', () => {
      setWalletAddress(null);
      setUserData(null);
    });

    return () => {
      peraWallet.connector?.off('disconnect');
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await fetchUserData(accounts[0]);
      }
    } catch (error: any) {
      if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error('Failed to connect:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    peraWallet.disconnect();
    setWalletAddress(null);
    setUserData(null);
  };

  const signTransactions = async (txnGroups: any[][]) => {
    if (!walletAddress) throw new Error('Wallet not connected');
    // FIX: Pass the raw transaction objects directly to Pera Wallet
    const signerGroups = txnGroups.map(group => group.map(txn => ({ txn })));
    return await peraWallet.signTransaction(signerGroups);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        isConnecting,
        peraWallet,
        connect,
        disconnect,
        signTransactions,
        userData,
        isLoading,
        refreshUserData
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}