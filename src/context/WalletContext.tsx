// src/context/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  peraWallet: PeraWalletConnect | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransactions: (txnGroups: Uint8Array[][]) => Promise<Uint8Array[]>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true,
  chainId: 416002, // Algorand TestNet
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Reconnect session on page load
    peraWallet.reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log('Reconnected to wallet:', accounts[0]);
        }
      })
      .catch((error) => {
        console.error('Failed to reconnect session:', error);
      });

    // Listen for disconnect events
    peraWallet.connector?.on('disconnect', () => {
      console.log('Wallet disconnected');
      setWalletAddress(null);
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
        console.log('Connected to wallet:', accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    peraWallet.disconnect();
    setWalletAddress(null);
    console.log('Disconnected from wallet');
  };

  const signTransactions = async (txnGroups: Uint8Array[][]) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    const signedTxns = await peraWallet.signTransaction(
      txnGroups.map(group => group.map(txn => ({ txn })))
    );
    return signedTxns;
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}