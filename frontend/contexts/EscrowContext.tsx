
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EscrowTransaction, TokenInfo } from '../types/escrow';
import { generateEscrowId } from '../utils/escrowUtils';

interface EscrowContextType {
  transactions: EscrowTransaction[];
  tokens: TokenInfo[];
  createEscrow: (data: Omit<EscrowTransaction, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void;
  releaseEscrow: (id: string) => void;
  disputeEscrow: (id: string, reason: string) => void;
  cancelEscrow: (id: string) => void;
  isConnected: boolean;
  userAddress: string;
  connectWallet: () => void;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export const useEscrow = () => {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
};

export const EscrowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  // Mock tokens for demo
  const tokens: TokenInfo[] = [
    { symbol: 'ACAR', address: '0x123...', name: 'Alice Car Token', currentPrice: 15.67 },
    { symbol: 'BFOOD', address: '0x456...', name: 'Bob Food Token', currentPrice: 8.42 },
    { symbol: 'CTECH', address: '0x789...', name: 'Charlie Tech Token', currentPrice: 23.91 },
  ];

  const connectWallet = () => {
    // Mock wallet connection
    setIsConnected(true);
    setUserAddress('0x742d35Cc6634C0532925a3b8D');
  };

  const createEscrow = (data: Omit<EscrowTransaction, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
    
    const newEscrow: EscrowTransaction = {
      ...data,
      id: generateEscrowId(),
      createdAt: now,
      expiresAt,
      status: 'active',
    };

    setTransactions(prev => [newEscrow, ...prev]);
  };

  const releaseEscrow = (id: string) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'released' as const } : tx)
    );
  };

  const disputeEscrow = (id: string, reason: string) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'disputed' as const, disputeReason: reason } : tx)
    );
  };

  const cancelEscrow = (id: string) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'cancelled' as const } : tx)
    );
  };

  // Initialize with some mock data
  useEffect(() => {
    const mockTransactions: EscrowTransaction[] = [
      {
        id: generateEscrowId(),
        tokenSymbol: 'ACAR',
        tokenAddress: '0x123...',
        amount: 500,
        buyer: '0x742d35Cc6634C0532925a3b8D',
        seller: '0x1234567890123456789012345',
        itemDescription: 'Toyota Camry 2020 - Excellent Condition',
        fulfillmentLink: 'https://example.com/car-delivery',
        status: 'active',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
      },
      {
        id: generateEscrowId(),
        tokenSymbol: 'BFOOD',
        tokenAddress: '0x456...',
        amount: 150,
        buyer: '0x742d35Cc6634C0532925a3b8D',
        seller: '0x9876543210987654321098765',
        itemDescription: 'Premium Catering Service for 50 people',
        status: 'released',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];
    
    setTransactions(mockTransactions);
  }, []);

  return (
    <EscrowContext.Provider value={{
      transactions,
      tokens,
      createEscrow,
      releaseEscrow,
      disputeEscrow,
      cancelEscrow,
      isConnected,
      userAddress,
      connectWallet,
    }}>
      {children}
    </EscrowContext.Provider>
  );
};
