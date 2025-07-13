import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@project-serum/anchor";
import { createEscrowTx } from "@/utils/escrowUtils";

export default function CreateEscrow() {
  const { publicKey, wallet, signTransaction } = useWallet();

  const [form, setForm] = useState({
    title: "",
    link: "",
    description: "",
    amount: "",
    seller: "",
    moderator: "",
    tokenMint: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!publicKey || !wallet || !signTransaction) return;

    const provider = new AnchorProvider(window.solana, wallet, {});
    const metadata = {
      title: form.title,
      link: form.link,
      description: form.description,
    };

    try {
      const tx = await createEscrowTx({
        provider,
        buyer: publicKey,
        seller: new PublicKey(form.seller),
        moderator: new PublicKey(form.moderator),
        tokenMint: new PublicKey(form.tokenMint),
        amount: parseInt(form.amount),
        metadata,
      });

      alert("Escrow Created! Tx: " + tx);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <input name="title" placeholder="Item Title" onChange={handleChange} />
      <input name="link" placeholder="Fulfillment Link" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="amount" placeholder="Token Amount" onChange={handleChange} />
      <input name="seller" placeholder="Seller Pubkey" onChange={handleChange} />
      <input name="moderator" placeholder="Moderator Pubkey" onChange={handleChange} />
      <input name="tokenMint" placeholder="Token Mint" onChange={handleChange} />
      <button onClick={handleSubmit}>Create Escrow</button>
    </div>
  );
}
