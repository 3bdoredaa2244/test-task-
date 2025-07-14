
export interface EscrowTransaction {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: number;
  buyer: string;
  seller: string;
  itemDescription: string;
  fulfillmentLink?: string;
  status: 'pending' | 'active' | 'disputed' | 'released' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  disputeReason?: string;
  moderator?: string;
}

export interface TokenInfo {
  symbol: string;
  address: string;
  name: string;
  currentPrice: number;
  logo?: string;
}

export type EscrowStatus = 'pending' | 'active' | 'disputed' | 'released' | 'cancelled';
