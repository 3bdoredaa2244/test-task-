import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { createZkCommitment } from "../lib/zk";
import idl from "@/idl/funhi_escrow.json";

const PROGRAM_ID = new PublicKey("YourProgramIDHere"); // Replace with real ID

export async function createEscrowTx({
  provider,
  buyer,
  seller,
  moderator,
  tokenMint,
  amount,
  metadata,
}: {
  provider: AnchorProvider;
  buyer: PublicKey;
  seller: PublicKey;
  moderator: PublicKey;
  tokenMint: PublicKey;
  amount: number;
  metadata: Record<string, any>;
}) {
  const program = new Program(idl as any, PROGRAM_ID, provider);
  const escrowAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), buyer.toBuffer()],
    program.programId
  )[0];

  const buyerTokenAccount = await getAssociatedTokenAddress(tokenMint, buyer);
  const vault = await getAssociatedTokenAddress(tokenMint, escrowAccount, true);

  const commitment = createZkCommitment(metadata);

  const tx = await program.methods
    .initEscrow(new BN(amount), Array.from(commitment))
    .accounts({
      buyer,
      seller,
      moderator,
      tokenMint,
      escrowAccount,
      buyerTokenAccount,
      vaultAccount: vault,
      tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      systemProgram: PublicKey.default,
      rent: PublicKey.default,
    })
    .rpc();

  return tx;
}
