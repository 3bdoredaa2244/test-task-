import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { FunhiEscrow } from "../target/types/funhi_escrow";

describe("funhi_escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FunhiEscrow as Program<FunhiEscrow>;

  it("Initializes escrow", async () => {
    const buyer = provider.wallet.publicKey;
    const seller = anchor.web3.Keypair.generate().publicKey;
    const moderator = anchor.web3.Keypair.generate().publicKey;
    const tokenMint = anchor.web3.Keypair.generate().publicKey;
    const [escrowPDA, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("escrow"), buyer.toBuffer()],
      program.programId
    );

    const zkCommitment = new Uint8Array(32); // example zero array

    await program.methods
      .initEscrow(new anchor.BN(1000), zkCommitment)
      .accounts({
        buyer,
        seller,
        moderator,
        tokenMint,
        escrowAccount: escrowPDA,
        // Add token accounts as needed
      })
      .rpc();

    const escrowAccount = await program.account.escrowAccount.fetch(escrowPDA);
    console.log("Escrow account:", escrowAccount);

    // Add asserts to verify escrowAccount fields
  });

  // Similarly add tests for release_escrow, raise_dispute, moderator_resolve, auto_release
});
