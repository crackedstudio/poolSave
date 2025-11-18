#[starknet::contract]
pub mod SaveQuestVault {
    use core::num::traits::Zero;
    use savequest_contract::constants::types::{Participant, Pool};
    use savequest_contract::interfaces::{
        IVToken::{IERC4626Dispatcher, IERC4626DispatcherTrait},
        IERC20::{IERC20Dispatcher, IERC20DispatcherTrait}
    };
    use savequest_contract::interfaces::INftPosition::{
        INftPosition721Dispatcher, INftPosition721DispatcherTrait,
    };
    use savequest_contract::interfaces::IVault::IVault;
    use starknet::storage::{
        Map, MutableVecTrait, StorageMapReadAccess, StorageMapWriteAccess, StoragePathEntry,
        StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, SyscallResultTrait, get_caller_address, get_contract_address, class_hash::ClassHash};
    use crate::constants::types::NFT_POSITION_CLASSHASH;
    use openzeppelin::upgrades::{interface::IUpgradeable, UpgradeableComponent};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CreatePoolEvent: CreatePoolEvent,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        JoinPoolEvent: JoinPoolEvent
    }

    #[derive(Drop, starknet::Event)]
    struct CreatePoolEvent {
        pool_id: u64,
        creator: ContractAddress,
        participants_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct JoinPoolEvent {
        pool_id: u64,
        participant: ContractAddress,
        participants_count: u32,
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        pool_count: u64,
        pools: Map<u64, Pool>,
        pool_participants: Map::<(u64, u32), Participant>,
        savings: Map<ContractAddress, u256>
    }

    #[abi(embed_v0)]
    impl SaveQuestVaultImpl of IVault<ContractState> {
        /// @notice Creates a new savings pool and deploys an associated NFT contract
        /// @dev
        ///  - Generates a new pool ID from the global counter
        ///  - Validates caller and contribution amount
        ///  - Deploys a fresh NFT contract representing participant positions
        ///  - Initializes NFT metadata (title, symbol, collection URI)
        ///  - Stores pool configuration in contract state
        ///  - Increments the global pool counter
        /// @param _title              Name/title of the pool
        /// @param _collection_symbol  Symbol for the pool’s NFT collection
        /// @param _contribution_amount Amount each participant must deposit
        /// @param _max_participants   Maximum allowed participants in the pool
        /// @param _deposit_token      ERC20 token contract used for contributions
        /// @param _yeild_contract     Yield strategy contract where deposits earn yield
        /// @param _start_date         Pool start timestamp (epoch seconds)
        /// @param _collection_uri     Metadata URI for the NFT collection
        /// @return pool_id            Unique identifier for the newly created pool
        fn create_pool(
            ref self: ContractState,
            _title: felt252,
            _collection_symbol: felt252,
            _contribution_amount: u256,
            _max_participants: u32,
            _deposit_token: ContractAddress,
            _yeild_contract: ContractAddress,
            _start_date: u64
        ) -> u64 {
            let _pool_id: u64 = self.pool_count.read();
            let _caller: ContractAddress = get_caller_address();
            let _address_this: ContractAddress = get_contract_address();

            assert(_caller.is_non_zero(), 'Invalid caller address');
            assert(_contribution_amount > 0_u256, 'Invalid amount');
            let (_nft_position_address, _ ) = deploy_syscall(
                NFT_POSITION_CLASSHASH.try_into().unwrap(),
                _start_date.into(),
                array![_address_this.into()].span(),
                true,
            ).unwrap_syscall();

            // INftPosition721Dispatcher { contract_address: _nft_position_address }
            //     .initialize(_title.try_into().unwrap(), _collection_symbol, _collection_uri);

            let new_pool_id: u64 = _pool_id + 1_u64;

            let _new_pool: Pool = Pool {
                id: new_pool_id,
                creator: _caller,
                participants_count: 0_u32,
                max_participants: _max_participants,
                contribution_amount: _contribution_amount,
                principal_amount: 0_u256,
                total_yield_distributed: 0_u256,
                start_timestamp: _start_date,
                duration: 0,
                last_harvest_timestamp: 0,
                rounds_completed: 0_u32,
                deposit_token: _deposit_token,
                position_nft: _nft_position_address,
                is_active: true,
                yeild_contract: _yeild_contract,
            };

            self.pools.write(new_pool_id, _new_pool);
            self.pool_count.write(new_pool_id);

            // emit createPool event
            self.emit(CreatePoolEvent {
                pool_id: new_pool_id,
                creator: _caller,
                participants_count: 0_u32,
            });

            new_pool_id
        }

        /// @notice Allows a user to join an existing savings pool
        /// @dev
        ///  - Validates caller address and pool status
        ///  - Ensures pool has available participant slots
        ///  - Verifies caller does not already hold a pool NFT
        ///  - Checks caller’s ERC20 balance and allowance
        ///  - Transfers the required contribution amount from caller to pool contract
        ///  - Mints an NFT position to represent caller’s membership in the pool
        ///  - Updates the participant count in pool state
        /// @param _pool_id   The unique identifier of the pool to join

        fn join_pool(ref self: ContractState, _pool_id: u64) {
            let _caller: ContractAddress = get_caller_address();
            let _address_this: ContractAddress = get_contract_address();

            let mut _pool: Pool = self.pools.read(_pool_id);
            let _nft_instance = INftPosition721Dispatcher { contract_address: _pool.position_nft };
            let _deposit_token_instance = IERC20Dispatcher {
                contract_address: _pool.deposit_token,
            };

            assert(_caller.is_non_zero(), 'Invalid caller address');
            assert(_pool.is_active, 'Pool is not active');
            assert(_pool.participants_count < _pool.max_participants, 'Pool is full');
            assert(_nft_instance.balance_of(_caller) == 0_u256, 'Already joined');
            assert(
                _deposit_token_instance.balance_of(_caller) >= _pool.contribution_amount,
                'Insufficient balance',
            );
            assert(
                _deposit_token_instance
                    .allowance(_caller, _address_this) >= _pool
                    .contribution_amount,
                'Insufficient allowance',
            );
            assert(
                _deposit_token_instance
                    .transfer_from(_caller, _address_this, _pool.contribution_amount),
                'Transfer failed',
            );

            let _participant: Participant = Participant {
                addr: _caller,
                deposited: _pool.contribution_amount,
                has_claimed: false,
                withdrawn: false,
            };

            _nft_instance.safe_mint(_caller);

            let _new_count = _pool.participants_count + 1_u32;
            let _new_principal_amt = _pool.principal_amount + _pool.contribution_amount;
            self.pool_participants.write((_pool_id, _new_count), _participant);
            self.pools.write(_pool_id, Pool{ participants_count: _new_count, principal_amount: _new_principal_amt, .._pool});
            self.savings.write(_caller, self.savings.read(_caller) + _pool.contribution_amount);

            self.emit(JoinPoolEvent{
                pool_id: _pool_id,
                participant: _caller,
                participants_count: _new_count,
            });

            if _new_count == _pool.max_participants {
                self._deposit_to_yeild(_pool_id);
            }
        }


        // ==== GETTER FUNCTIONS ====
        fn get_pool_count (self: @ContractState) -> u64 {
            self.pool_count.read()
        }

        fn get_pool(self: @ContractState, _pool_id: u64) -> Pool {
            self.pools.read(_pool_id)
        }

        fn get_all_pools(self: @ContractState) -> Array<Pool> {
            let mut _all_pools = array![];
            let mut i = 1;
            let _player_count = self.pool_count.read();

            while i < _player_count + 1_u64 {
                let _pool = self.pools.read(i);
                _all_pools.append(_pool);
                i = i + 1;
            }

            _all_pools
        }

        fn get_user_savings(self: @ContractState, address: ContractAddress) -> u256 {
            self.savings.read(address)
        }

        fn get_participant(self: @ContractState, _pool_id: u64, _participant_id: u32) -> Participant {
            self.pool_participants.read((_pool_id, _participant_id))
        }

        fn get_all_participants(self: @ContractState, _pool_id: u64) -> Array<Participant> {
            let mut _all_participants = array![];
            let mut i = 1;
            let _participant_count = self.pools.read(_pool_id).participants_count;

            while i < _participant_count + 1_u32 {
                let _participant = self.pool_participants.read((_pool_id, i));
                _all_participants.append(_participant);
                i = i + 1;
            }

            _all_participants
        }
    }

    #[generate_trait]
    impl PrivateImpl of PrivateTrait {
        fn _deposit_to_yeild (ref self: ContractState, _pool_id: u64) {
            let _address_this = get_contract_address();
            let _pool: Pool = self.pools.read(_pool_id);
            let _deposit_token_instance = IERC20Dispatcher { contract_address: _pool.deposit_token };
            assert(
                _deposit_token_instance.approve(_pool.yeild_contract, _pool.principal_amount),
                'Approve failed',
            );
            // Call yeild contract deposit method
            let _yeild_contract_instance = IERC4626Dispatcher { contract_address: _pool.yeild_contract }; 

            _yeild_contract_instance.deposit(_pool.principal_amount, _address_this);
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            // let caller = get_caller_address();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
}
