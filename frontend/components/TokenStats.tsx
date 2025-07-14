
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEscrow } from '../contexts/EscrowContext';

const TokenStats: React.FC = () => {
  const { tokens, transactions } = useEscrow();

  const getTokenStats = (tokenSymbol: string) => {
    const tokenTransactions = transactions.filter(tx => tx.tokenSymbol === tokenSymbol);
    const totalVolume = tokenTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const successfulTrades = tokenTransactions.filter(tx => tx.status === 'released').length;
    
    // Mock price change
    const priceChange = (Math.random() - 0.5) * 10;
    
    return {
      totalVolume,
      successfulTrades,
      priceChange,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {tokens.map(token => {
        const stats = getTokenStats(token.symbol);
        const isPositive = stats.priceChange >= 0;
        
        return (
          <div key={token.symbol} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{token.symbol}</h3>
                <p className="text-sm text-gray-400">{token.name}</p>
              </div>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{stats.priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Price:</span>
                <span className="text-white font-medium">${token.currentPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Volume:</span>
                <span className="text-white font-medium">{stats.totalVolume} {token.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Trades:</span>
                <span className="text-white font-medium">{stats.successfulTrades}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TokenStats;
