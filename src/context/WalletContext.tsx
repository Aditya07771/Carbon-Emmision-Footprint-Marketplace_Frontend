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



// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { PeraWalletConnect } from '@perawallet/connect';

// const peraWallet = new PeraWalletConnect();

// interface WalletContextType {
//   accountAddress: string | null;
//   role: 'admin' | 'ngo' | 'business' | 'public' | null;
//   connectWallet: () => void;
//   disconnectWallet: () => void;
// }

// const WalletContext = createContext<WalletContextType>({
//   accountAddress: null,
//   role: null,
//   connectWallet: () => {},
//   disconnectWallet: () => {},
// });

// export const useWallet = () => useContext(WalletContext);

// export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [accountAddress, setAccountAddress] = useState<string | null>(null);
//   const [role, setRole] = useState<'admin' | 'ngo' | 'business' | 'public' | null>(null);

//   useEffect(() => {
//     // Reconnect session on reload
//     peraWallet.reconnectSession().then((accounts) => {
//       if (accounts.length) {
//         setAccountAddress(accounts[0]);
//         fetchUserRole(accounts[0]);
//       }
//     });

//     peraWallet.connector?.on('disconnect', disconnectWallet);
//   }, []);

//   const fetchUserRole = async (address: string) => {
//     try {
//       const response = await fetch(`/api/users/role/${address}`);
//       const data = await response.json();
//       if (data.success) {
//         setRole(data.role);
//       }
//     } catch (error) {
//       console.error('Error fetching role:', error);
//       setRole('public'); // Default fallback
//     }
//   };

//   const connectWallet = async () => {
//     try {
//       const newAccounts = await peraWallet.connect();
//       setAccountAddress(newAccounts[0]);
//       fetchUserRole(newAccounts[0]);
//     } catch (error) {
//       console.error('Failed to connect to Pera Wallet:', error);
//     }
//   };

//   const disconnectWallet = () => {
//     peraWallet.disconnect();
//     setAccountAddress(null);
//     setRole(null);
//   };

//   return (
//     <WalletContext.Provider value={{ accountAddress, role, connectWallet, disconnectWallet }}>
//       {children}
//     </WalletContext.Provider>
//   );
// };