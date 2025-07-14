
import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';
import { EscrowProvider } from '../contexts/EscrowContext';
import WalletConnect from '../components/WalletConnect';
import CreateEscrow from '../components/CreateEscrow';
import EscrowCard from '../components/EscrowCard';
import TokenStats from '../components/TokenStats';
import { useEscrow } from '../contexts/EscrowContext';

const EscrowDashboard: React.FC = () => {
  const { transactions, isConnected } = useEscrow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Token<span className="text-purple-400">Escrow</span>
            </h1>
            <p className="text-gray-400">Decentralized escrow for token-based commerce</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <WalletConnect />
            {isConnected && <CreateEscrow />}
          </div>
        </div>

        {/* Features Section */}
        {!isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure Escrow</h3>
              <p className="text-gray-400">Automated smart contracts protect both buyers and sellers with 48-hour release windows.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Token Appreciation</h3>
              <p className="text-gray-400">Every successful trade increases token value, creating incentives for quality service.</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <Lock className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Dispute Resolution</h3>
              <p className="text-gray-400">Built-in moderation system handles disputes with proof-of-delivery requirements.</p>
            </div>
          </div>
        )}

        {/* Connected User Dashboard */}
        {isConnected && (
          <>
            <TokenStats />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Escrow Transactions</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                  <p className="text-gray-400 text-lg">No escrow transactions yet</p>
                  <p className="text-gray-500 mt-2">Create your first escrow to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transactions.map(transaction => (
                    <EscrowCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Create Token</h3>
              <p className="text-gray-400 text-sm">Business owners mint tokens representing their services or products</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Buyer Purchases</h3>
              <p className="text-gray-400 text-sm">Buyers lock tokens in escrow when making purchases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Automatic Release</h3>
              <p className="text-gray-400 text-sm">Funds auto-release after 48 hours or buyer confirmation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold text-white mb-2">Token Appreciation</h3>
              <p className="text-gray-400 text-sm">Successful trades increase token value for all holders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <EscrowProvider>
      <EscrowDashboard />
    </EscrowProvider>
  );
};

export default Index;
