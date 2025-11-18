#[starknet::contract]
pub mod SavequestFactory {
    use core::traits::{Into, TryInto};
    use savequest_contract::constants::types::SAVEQUEST_CLASSHASH;
    use starknet::storage::{
        Map, MutableVecTrait, StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use starknet::syscalls::deploy_syscall;
    use starknet::{
        ClassHash, ContractAddress, SyscallResultTrait, class_hash, get_caller_address,
        get_contract_address,
    };

    #[storage]
    struct Storage {
        vault_count: u256,
    }

    fn create_vault(
        ref self: ContractState,
        _token_address: ContractAddress,
        _contribution_amount: u256,
        _max_participants: u256,
        _salt: felt252,
    ) -> ContractAddress {
        let mut constructor_calldata = array![
            _token_address.into(), _contribution_amount, _max_participants,
        ];
        let classhash: ClassHash = SAVEQUEST_CLASSHASH.try_into().unwrap();
        let result = deploy_syscall(classhash, _salt, constructor_calldata.span(), true);
        let (vault_address, _) = result.unwrap_syscall();

        vault_address
    }
}
