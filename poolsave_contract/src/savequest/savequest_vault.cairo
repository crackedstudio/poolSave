#[starknet::contract]
pub mod SavequestVault {
    use savequest_contract::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        Map, MutableVecTrait, StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use starknet::{
        ContractAddress, contract_address, get_block_timestamp, get_caller_address,
        get_contract_address,
    };

    #[storage]
    struct Storage {
        token_address: ContractAddress,
        contribution_amount: u256,
        max_participants: u256,
        current_participants: u256,
        total_deposited: u256,
        yeilds_generated: u256,
        current_round: u256,
        created_at: u64,
        is_active: bool,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        _token_address: ContractAddress,
        _contribution_amount: u256,
        _max_participants: u256,
    ) {
        self.token_address.write(_token_address);
        self.contribution_amount.write(_contribution_amount);
        self.max_participants.write(_max_participants);
        self.current_participants.write(0);
        self.total_deposited.write(0);
        self.yeilds_generated.write(0);
        self.current_round.write(0);
        self.created_at.write(get_block_timestamp());
        self.is_active.write(true);
        // emit vault created event
    }

    fn join_vault(ref self: ContractState) -> bool {
        let _caller = get_caller_address();
        let _contract_address = get_contract_address();
        let _token_address = self.token_address.read();
        let _contribution_amount = self.contribution_amount.read();
        let _token_instace = IERC20Dispatcher { contract_address: _token_address };

        // require vault is active
        assert(self.is_active.read(), 'Vault is not active');

        // require participants not full
        assert(self.current_participants.read() < self.max_participants.read(), 'Vault is full');

        // require participant havent minted nft yet

        // require the caller have the amount to deposit to the pool
        assert(
            _token_instace.balance_of(_caller) >= self.contribution_amount.read(),
            'Insufficient balance',
        );

        // transfer funds to the vault
        assert(
            _token_instace.transfer_from(_caller, _contract_address, _contribution_amount),
            'Transfer failed',
        );

        // mint nft to the caller

        // update the vault state
        self.current_participants.write(self.current_participants.read() + 1);
        self.total_deposited.write(self.total_deposited.read() + _contribution_amount);

        // start yeild generation if participants is full
        if (self
            .current_participants
            .read() == self
            .max_participants
            .read()) { // start yeild generation logic
        }

        true
    }
}
