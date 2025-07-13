import { EscrowAccount } from "@/types/escrow";
import { useWallet } from "@solana/wallet-adapter-react";

export default function EscrowCard({ escrow }: { escrow: EscrowAccount }) {
  const { publicKey } = useWallet();

  const isBuyer = publicKey?.toBase58() === escrow.buyer;
  const isModerator = publicKey?.toBase58() === escrow.moderator;

  return (
    <div className="p-4 rounded-xl border shadow bg-white space-y-2">
      <h3 className="text-lg font-bold">{escrow.title}</h3>
      <p>Status: <span className="font-medium">{escrow.status}</span></p>

      {isBuyer && escrow.status === "Pending" && (
        <div className="space-x-2">
          <button onClick={() => releaseEscrow(escrow)}>Release</button>
          <button onClick={() => disputeEscrow(escrow)}>Dispute</button>
        </div>
      )}

      {isModerator && escrow.status === "Disputed" && (
        <div className="space-x-2">
          <button onClick={() => resolveEscrow(escrow, true)}>Send to Seller</button>
          <button onClick={() => resolveEscrow(escrow, false)}>Refund Buyer</button>
        </div>
      )}

      {/* Optional: Anyone can trigger auto-release */}
      {escrow.status === "Pending" && isBuyer && (
        <button onClick={() => autoRelease(escrow)}>Force Auto-Release</button>
      )}
    </div>
  );
}
