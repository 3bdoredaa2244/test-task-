use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("Fg6PaFpoGXkYsidMpWxTWqgx8SLfypMczhDtXZzY6uVn"); // Replace with your actual program ID

#[program]
pub mod funhi_escrow {
    use super::*;

    pub fn init_escrow(
        ctx: Context<InitEscrow>,
        amount: u64,
        zk_commitment: [u8; 32],
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
        escrow.bump = *ctx.bumps.get("escrow_account").unwrap();

        // Transfer tokens from buyer to vault
        token::transfer(
            ctx.accounts.transfer_ctx(),
            amount,
        )?;

        Ok(())
    }

    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);
        require!(ctx.accounts.buyer.key() == escrow.buyer, EscrowError::Unauthorized);

        // Transfer funds to seller
        token::transfer(
            ctx.accounts.transfer_ctx(),
            escrow.amount,
        )?;

        escrow.status = EscrowStatus::Released;
        Ok(())
    }

    pub fn auto_release(ctx: Context<AutoRelease>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);

        let now = Clock::get()?.unix_timestamp;
        require!(
            now - escrow.start_time >= 48 * 3600,
            EscrowError::TooEarly
        );

        // Auto transfer funds to seller
        token::transfer(
            ctx.accounts.transfer_ctx(),
            escrow.amount,
        )?;

        escrow.status = EscrowStatus::Released;
        Ok(())
    }

    pub fn raise_dispute(ctx: Context<RaiseDispute>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.status == EscrowStatus::Pending, EscrowError::InvalidStatus);
        require!(ctx.accounts.buyer.key() == escrow.buyer, EscrowError::Unauthorized);

        escrow.status = EscrowStatus::Disputed;
        Ok(())
    }

    pub fn moderator_resolve(ctx: Context<ModeratorResolve>, release_to_seller: bool) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.status == EscrowStatus::Disputed, EscrowError::InvalidStatus);
        require!(ctx.accounts.moderator.key() == escrow.moderator, EscrowError::Unauthorized);

        if release_to_seller {
            // Transfer to seller
            token::transfer(ctx.accounts.transfer_ctx(), escrow.amount)?;
        } else {
            // Refund to buyer
            token::transfer(ctx.accounts.refund_ctx(), escrow.amount)?;
        }

        escrow.status = EscrowStatus::Resolved;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct InitEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: only used for Pubkey
    pub seller: AccountInfo<'info>,
    /// CHECK: only used for Pubkey
    pub moderator: AccountInfo<'info>,
    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowAccount::LEN,
        seeds = [b"escrow", buyer.key().as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == token_mint.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        seeds = [b"vault", buyer.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = escrow_account
    )]
    pub vault_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"escrow", escrow_account.buyer.as_ref()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AutoRelease<'info> {
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"escrow", escrow_account.buyer.as_ref()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, seeds = [b"escrow", escrow_account.buyer.as_ref()], bump = escrow_account.bump)]
    pub escrow_account: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct ModeratorResolve<'info> {
    pub moderator: Signer<'info>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"escrow", escrow_account.buyer.as_ref()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct EscrowAccount {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub moderator: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub zk_commitment: [u8; 32],
    pub start_time: i64,
    pub status: EscrowStatus,
    pub bump: u8,
}

impl EscrowAccount {
    pub const LEN: usize = 32 * 4 + 8 + 32 + 8 + 1 + 1; // = 177
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Pending,
    Released,
    Disputed,
    Resolved,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid status")]
    InvalidStatus,
    #[msg("Not authorized")]
    Unauthorized,
    #[msg("Too early to auto release")]
    TooEarly,
}

impl<'info> InitEscrow<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.buyer_token_account.to_account_info().clone(),
            to: self.vault_account.to_account_info().clone(),
            authority: self.buyer.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

impl<'info> ReleaseEscrow<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info(),
            to: self.seller_token_account.to_account_info(),
            authority: self.escrow_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> AutoRelease<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info(),
            to: self.seller_token_account.to_account_info(),
            authority: self.escrow_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> ModeratorResolve<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info(),
            to: self.seller_token_account.to_account_info(),
            authority: self.escrow_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn refund_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info(),
            to: self.buyer_token_account.to_account_info(),
            authority: self.escrow_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}
