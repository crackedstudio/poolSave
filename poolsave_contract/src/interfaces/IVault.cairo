use starknet::ContractAddress;
use savequest_contract::constants::types::{Pool, Participant};

#[starknet::interface]
pub trait IVault<TContractState> {
    fn create_pool(
        ref self: TContractState,
        _title: felt252,
        _collection_symbol: felt252,
        _contribution_amount: u256,
        _max_participants: u32,
        _deposit_token: ContractAddress,
        _yeild_contract: ContractAddress,
        _start_date: u64
    ) -> u64;

    fn join_pool(ref self: TContractState, _pool_id: u64);
    fn get_pool_count (self: @TContractState) -> u64;
    fn get_pool(self: @TContractState, _pool_id: u64) -> Pool;
    fn get_all_pools(self: @TContractState) -> Array<Pool>;
    fn get_user_savings(self: @TContractState, address: ContractAddress) -> u256;
    fn get_participant(self: @TContractState, _pool_id: u64, _participant_id: u32) -> Participant;
    fn get_all_participants(self: @TContractState, _pool_id: u64) -> Array<Participant>;
}
