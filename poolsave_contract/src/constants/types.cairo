use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
struct VaultInfo {
    contribution_amount: u256,
    max_participants: u256,
    current_participants: u256,
    total_deposited: u256,
    yeilds_generated: u256,
    current_round: u256,
    created_at: u64,
    is_active: bool,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Pool {
    pub id: u64,
    pub creator: ContractAddress,
    pub participants_count: u32,
    pub max_participants: u32,
    pub contribution_amount: u256,
    pub principal_amount: u256,
    pub total_yield_distributed: u256,
    pub start_timestamp: u64,
    pub duration: u64,
    pub last_harvest_timestamp: u64,
    pub rounds_completed: u32,
    pub deposit_token: ContractAddress,
    pub position_nft: ContractAddress,
    pub is_active: bool,
    pub yeild_contract: ContractAddress,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Participant {
    pub addr: ContractAddress,
    pub deposited: u256,
    pub has_claimed: bool,
    pub withdrawn: bool,
}

pub const SAVEQUEST_CLASSHASH: felt252 = 0x0123;
pub const NFT_POSITION_CLASSHASH: felt252 = 0x2aff0c118d63941e05f8fa79753ecb7c1047548b97ddddd6def2ece6cc10f08;
    
    
    // 0x3b97d6c69365f8be3029b84bd134c08b0994e7550d7d6216808b27c4973f260;
