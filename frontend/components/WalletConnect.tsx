
import React from 'react';
import { Wallet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEscrow } from '../contexts/EscrowContext';

const WalletConnect: React.FC = () => {
  const { isConnected, userAddress, connectWallet } = useEscrow();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400">
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700">
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;
