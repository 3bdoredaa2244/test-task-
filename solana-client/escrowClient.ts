import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Replace with your deployed program ID
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWxTWqgx8SLfypMczhDtXZzY6uVn");

const ESCROW_SEED = "escrow";

// Connect to devnet or localnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load your wallet keypair here or from Anchor provider
const wallet = anchor.Wallet.local();

const provider = new anchor.AnchorProvider(connection, wallet, {
  preflightCommitment: "processed",
});

anchor.setProvider(provider);

const program = new anchor.Program(
  // Load your IDL JSON file here or import
  require("./idl/funhi_escrow.json"),
  PROGRAM_ID,
  provider
);

// Initialize escrow example
export async function initEscrow(
  buyerPubkey: PublicKey,
  sellerPubkey: PublicKey,
  moderatorPubkey: PublicKey,
  tokenMintPubkey: PublicKey,
  amount: number,
  zkCommitment: Uint8Array
) {
  // Derive escrow PDA
  const [escrowPDA, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(ESCROW_SEED), buyerPubkey.toBuffer()],
    PROGRAM_ID
  );

  const tx = await program.methods
    .initEscrow(new anchor.BN(amount), zkCommitment)
    .accounts({
      buyer: buyerPubkey,
      seller: sellerPubkey,
      moderator: moderatorPubkey,
      tokenMint: tokenMintPubkey,
      escrowAccount: escrowPDA,
      // Add other required accounts like token accounts
    })
    .rpc();

  console.log("Escrow initialized:", tx);
  return tx;
}

// You can similarly add releaseEscrow, raiseDispute, moderatorResolve functions
