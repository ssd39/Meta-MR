use anchor_lang::prelude::*;

#[program]
mod basic_1 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: String) -> ProgramResult {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        my_account.partner =  *ctx.accounts.partner.key;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 1028)]
    pub my_account: ProgramAccount<'info, MyAccount>,
    pub user: AccountInfo<'info>,
    pub partner: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(signer)]
    #[account(mut)]
    pub my_account: ProgramAccount<'info, MyAccount>,
    pub partner: AccountInfo<'info>,
}

#[account]
pub struct MyAccount {
    pub data: String,
    pub partner: Pubkey  
}
