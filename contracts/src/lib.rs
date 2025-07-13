use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer, Token, Mint};

declare_id!("YourProgramID");

#[program]
pub mod funhi_escrow {
    use super::*;

    pub fn init_escrow(
        ctx: Context<InitEscrow>,
        amount: u64,
        zk_commitment: [u8; 32], // compressed fulfillment hash
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.moderator = ctx.accounts.moderator.key();
        escrow.token_mint = ctx.accounts.token_mint.key();
        escrow.amount = amount;
        escrow.zk_commitment = zk_commitment;
        escrow.start_time = Clock::get()?.unix_timestamp;
        escrow.status = EscrowStatus::Pending;
        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);

        // Transfer funds from escrow vault to seller
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.clone(),
        };
        let seeds = &[b"vault".as_ref(), &[ctx.accounts.escrow_account.bump]];
        let signer = &[&seeds[..]];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer), escrow.amount)?;

        escrow.status = EscrowStatus::Released;
        Ok(())
    }

    // add: raise_dispute(), auto_release(), moderator_resolve()
}
