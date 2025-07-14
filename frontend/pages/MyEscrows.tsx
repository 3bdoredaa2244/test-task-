// ✅ 1. MyEscrows.tsx page to display escrow info
// 📁 File: src/pages/MyEscrows.tsx

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";
import { fetchEscrow } from "@/utils/escrowUtils";
import EscrowCard from "@/components/EscrowCard";
import { getMockMetadata } from "@/utils/mockMetadata";
import { PublicKey } from "@solana/web3.js";

export default function MyEscrows() {
  const { publicKey, wallet } = useWallet();
  const [escrow, setEscrow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any | null>(null);

  useEffect(() => {
    if (!publicKey || !wallet) return;
    const provider = new AnchorProvider(window.solana, wallet, {});

    (async () => {
      try {
        const data = await fetchEscrow({ provider, buyer: publicKey });
        setEscrow(data);

        // Simulate metadata lookup
        const meta = getMockMetadata(data.commitment);
        setMetadata(meta);
      } catch (err) {
        console.warn("No escrow found", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey, wallet]);

  if (loading) return <p className="p-4">Loading escrow info...</p>;
  if (!escrow) return <p className="p-4">No active escrows found for your wallet.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">My Escrow</h2>
      {metadata && (
        <div className="bg-white p-4 rounded shadow text-sm">
          <p><strong>Item:</strong> {metadata.title}</p>
          <p><strong>Description:</strong> {metadata.description}</p>
          <a href={metadata.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Fulfillment Link
          </a>
        </div>
      )}

      <EscrowCard
        buyer={escrow.buyer.toBase58()}
        seller={escrow.seller.toBase58()}
        moderator={escrow.moderator.toBase58()}
        tokenMint={escrow.tokenMint.toBase58()}
        sellerTokenAccount={escrow.sellerTokenAccount.toBase58()}
        buyerTokenAccount={escrow.buyerTokenAccount.toBase58()}
        status={escrow.status}
        role="buyer"
      />
    </div>
  );
}
