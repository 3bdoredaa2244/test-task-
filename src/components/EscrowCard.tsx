// ✅ 1. Updated EscrowCard.tsx (Frontend component)
// 📁 File: src/components/EscrowCard.tsx

import React from "react";
import { releaseEscrow, raiseDispute, moderatorResolve } from "@/utils/escrowUtils";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

interface EscrowCardProps {
  buyer: string;
  seller: string;
  moderator: string;
  tokenMint: string;
  sellerTokenAccount: string;
  buyerTokenAccount: string;
  status: string;
  role: "buyer" | "moderator";
}

export default function EscrowCard({
  buyer,
  seller,
  moderator,
  tokenMint,
  sellerTokenAccount,
  buyerTokenAccount,
  status,
  role,
}: EscrowCardProps) {
  const { publicKey, wallet } = useWallet();

  const provider = new AnchorProvider(window.solana, wallet, {});

  const handleRelease = async () => {
    await releaseEscrow({
      provider,
      buyer: new PublicKey(buyer),
      tokenMint: new PublicKey(tokenMint),
      sellerTokenAccount: new PublicKey(sellerTokenAccount),
    });
    alert("Escrow released to seller");
  };

  const handleDispute = async () => {
    await raiseDispute({
      provider,
      buyer: new PublicKey(buyer),
    });
    alert("Dispute raised");
  };

  const handleModeratorDecision = async (releaseToSeller: boolean) => {
    await moderatorResolve({
      provider,
      buyer: new PublicKey(buyer),
      moderator: new PublicKey(moderator),
      tokenMint: new PublicKey(tokenMint),
      sellerTokenAccount: new PublicKey(sellerTokenAccount),
      buyerTokenAccount: new PublicKey(buyerTokenAccount),
      releaseToSeller,
    });
    alert("Moderator resolved escrow");
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h3>Escrow for Buyer: {buyer.slice(0, 8)}...</h3>
      <p>Status: {status}</p>

      {role === "buyer" && status === "active" && (
        <div className="space-x-2 mt-2">
          <button onClick={handleRelease} className="btn btn-primary">
            Release Escrow
          </button>
          <button onClick={handleDispute} className="btn btn-danger">
            Raise Dispute
          </button>
        </div>
      )}

      {role === "moderator" && status === "disputed" && (
        <div className="space-x-2 mt-2">
          <button onClick={() => handleModeratorDecision(true)} className="btn btn-success">
            Release to Seller
          </button>
          <button onClick={() => handleModeratorDecision(false)} className="btn btn-warning">
            Refund Buyer
          </button>
        </div>
      )}
    </div>
  );
}
