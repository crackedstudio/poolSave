use core::num::traits::zero::Zero;
use core::traits::{Into, TryInto};
use savequest_contract::interfaces::INftPosition::{
    INftPosition721Dispatcher, INftPosition721DispatcherTrait,
};
use savequest_contract::interfaces::IVault::{IVaultDispatcher, IVaultDispatcherTrait};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp,
    start_cheat_caller_address, stop_cheat_block_timestamp, stop_cheat_caller_address,
};
use starknet::{ContractAddress, get_block_timestamp};

pub mod Accounts {
    use core::traits::TryInto;
    use starknet::ContractAddress;

    pub fn zero() -> ContractAddress {
        0x0000000000000000000000000000000000000000.try_into().unwrap()
    }

    pub fn account1() -> ContractAddress {
        'account1'.try_into().unwrap()
    }

    pub fn account2() -> ContractAddress {
        'account2'.try_into().unwrap()
    }
}

fn deploy(name: ByteArray) -> ContractAddress {
    let constructor_args = array![];
    let savequest_vault_contract = declare(name).unwrap().contract_class();
    let (contract_address, _) = savequest_vault_contract.deploy(@constructor_args).unwrap();
    contract_address
}

#[test]
fn test_can_deploy_savequest() {
    let vault_address = deploy("SaveQuestVault");
    let vault_instance = IVaultDispatcher { contract_address: vault_address };

    assert(vault_address.is_non_zero(), 'Not deployed');
}


fn create_pool() -> (ContractAddress, u64) {
    let vault_address = deploy("SaveQuestVault");
    let vault_instance = IVaultDispatcher { contract_address: vault_address };

    let title: felt252 = 'Test';
    let symbol: felt252 = 'TST';
    let ten_mins: u64 = 600;
    let max_participants: u32 = 5;
    let contribution_amount: u256 = 10_000_000_000_000; //

    let pool_id = vault_instance
        .create_pool(
            title,
            symbol,
            contribution_amount,
            max_participants,
            Accounts::account1(),
            Accounts::account2(),
            get_block_timestamp() + ten_mins,
        );

    (vault_address, pool_id)
}

#[test]
fn test_can_create_pool() {
    let (vault_address, pool_id) = create_pool();
    let vault_instance = IVaultDispatcher { contract_address: vault_address };

    assert(vault_address.is_non_zero(), 'not deployed');
}
