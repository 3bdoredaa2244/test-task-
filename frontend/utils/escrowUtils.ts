import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/idl/funhi_escrow.json";

const PROGRAM_ID = new PublicKey("YourProgramIDHere"); // replace with actual ID

export async function releaseEscrow({
  provider,
  buyer,
  tokenMint,
  sellerTokenAccount,
}: {
  provider: AnchorProvider;
  buyer: PublicKey;
  tokenMint: PublicKey;
  sellerTokenAccount: PublicKey;
}) {
  const program = new Program(idl as any, PROGRAM_ID, provider);

  const escrowAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), buyer.toBuffer()],
    program.programId
  )[0];

  const vault = await getAssociatedTokenAddress(tokenMint, escrowAccount, true);

  return program.methods
    .releaseEscrow()
    .accounts({
      buyer,
      escrowAccount,
      vaultAccount: vault,
      sellerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function raiseDispute({
  provider,
  buyer,
}: {
  provider: AnchorProvider;
  buyer: PublicKey;
}) {
  const program = new Program(idl as any, PROGRAM_ID, provider);

  const escrowAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), buyer.toBuffer()],
    program.programId
  )[0];

  return program.methods
    .raiseDispute()
    .accounts({
      buyer,
      escrowAccount,
    })
    .rpc();
}

export async function moderatorResolve({
  provider,
  buyer,
  moderator,
  tokenMint,
  sellerTokenAccount,
  buyerTokenAccount,
  releaseToSeller,
}: {
  provider: AnchorProvider;
  buyer: PublicKey;
  moderator: PublicKey;
  tokenMint: PublicKey;
  sellerTokenAccount: PublicKey;
  buyerTokenAccount: PublicKey;
  releaseToSeller: boolean;
}) {
  const program = new Program(idl as any, PROGRAM_ID, provider);

  const escrowAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), buyer.toBuffer()],
    program.programId
  )[0];

  const vault = await getAssociatedTokenAddress(tokenMint, escrowAccount, true);

  return program.methods
    .moderatorResolve(releaseToSeller)
    .accounts({
      moderator,
      escrowAccount,
      vaultAccount: vault,
      sellerTokenAccount,
      buyerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function fetchEscrow({
  provider,
  buyer,
}: {
  provider: AnchorProvider;
  buyer: PublicKey;
}) {
  const program = new Program(idl as any, PROGRAM_ID, provider);

  const escrowAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), buyer.toBuffer()],
    program.programId
  )[0];

  const data = await program.account.escrowAccount.fetch(escrowAccount);
  return { ...data, publicKey: escrowAccount.toBase58() };
}
