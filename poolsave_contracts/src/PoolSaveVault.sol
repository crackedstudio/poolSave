// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Pool, Participant} from "./types/PoolSaveTypes.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IERC4626} from "./interfaces/IERC4626.sol";
import {INftPosition} from "./interfaces/INftPosition.sol";
import {NftPosition} from "./NftPosition.sol";

/**
 * @title PoolSaveVault
 * @notice Main contract managing all savings pools, participants, and interactions
 */
contract PoolSaveVault {
    // Events
    event CreatePoolEvent(
        uint64 indexed poolId,
        address indexed creator,
        uint32 participantsCount
    );

    event JoinPoolEvent(
        uint64 indexed poolId,
        address indexed participant,
        uint32 participantsCount
    );

    // Storage
    uint64 public poolCount;
    mapping(uint64 => Pool) public pools;
    mapping(uint64 => mapping(uint32 => Participant)) public poolParticipants;
    mapping(address => uint256) public savings;

    constructor() {}

    /**
     * @notice Creates a new savings pool and deploys an associated NFT contract
     * @param _collectionSymbol Symbol for NFT collection
     * @param _contributionAmount Amount each participant must deposit
     * @param _maxParticipants Maximum allowed participants
     * @param _depositToken ERC20 token address for contributions
     * @param _yieldContract ERC4626 vault address for yield generation
     * @param _startDate Pool start timestamp
     * @return The new pool ID
     */
    function createPool(
        string memory /* _title */,
        string memory _collectionSymbol,
        uint256 _contributionAmount,
        uint32 _maxParticipants,
        address _depositToken,
        address _yieldContract,
        uint64 _startDate
    ) external returns (uint64) {
        require(msg.sender != address(0), "Invalid caller address");
        require(_contributionAmount > 0, "Invalid amount");
        require(_depositToken != address(0), "Invalid deposit token");
        require(_yieldContract != address(0), "Invalid yield contract");
        require(_maxParticipants > 0, "Invalid max participants");

        uint64 newPoolId = ++poolCount;

        // Deploy new NFT contract
        NftPosition nftContract = new NftPosition(_collectionSymbol, _collectionSymbol, address(this));
        address nftAddress = address(nftContract);

        // Initialize pool
        pools[newPoolId] = Pool({
            id: newPoolId,
            creator: msg.sender,
            participantsCount: 0,
            maxParticipants: _maxParticipants,
            contributionAmount: _contributionAmount,
            principalAmount: 0,
            totalYieldDistributed: 0,
            startTimestamp: _startDate,
            duration: 0,
            lastHarvestTimestamp: 0,
            roundsCompleted: 0,
            depositToken: _depositToken,
            positionNft: nftAddress,
            isActive: true,
            yieldContract: _yieldContract
        });

        emit CreatePoolEvent(newPoolId, msg.sender, 0);
        return newPoolId;
    }

    /**
     * @notice Allows a user to join an existing pool by depositing the required contribution
     * @param _poolId The pool ID to join
     */
    function joinPool(uint64 _poolId) external {
        require(msg.sender != address(0), "Invalid caller address");

        Pool storage pool = pools[_poolId];
        require(pool.id != 0, "Pool does not exist");
        require(pool.isActive, "Pool is not active");
        require(pool.participantsCount < pool.maxParticipants, "Pool is full");

        INftPosition nftContract = INftPosition(pool.positionNft);
        require(nftContract.balanceOf(msg.sender) == 0, "Already joined");

        IERC20 token = IERC20(pool.depositToken);
        require(token.balanceOf(msg.sender) >= pool.contributionAmount, "Insufficient balance");
        require(
            token.allowance(msg.sender, address(this)) >= pool.contributionAmount,
            "Insufficient allowance"
        );

        // Transfer tokens from user to vault
        require(
            token.transferFrom(msg.sender, address(this), pool.contributionAmount),
            "Transfer failed"
        );

        // Mint NFT to user
        nftContract.safeMint(msg.sender);

        // Create participant record
        uint32 newCount = pool.participantsCount + 1;
        poolParticipants[_poolId][newCount] = Participant({
            addr: msg.sender,
            deposited: pool.contributionAmount,
            hasClaimed: false,
            withdrawn: false
        });

        // Update pool state
        pool.participantsCount = newCount;
        pool.principalAmount += pool.contributionAmount;

        // Update user savings
        savings[msg.sender] += pool.contributionAmount;

        emit JoinPoolEvent(_poolId, msg.sender, newCount);

        // If pool is full, deploy funds to yield contract
        if (newCount == pool.maxParticipants) {
            _depositToYield(_poolId);
        }
    }

    /**
     * @notice Automatically deploys pool funds to yield-generating contract when pool reaches capacity
     * @param _poolId The pool ID
     */
    function _depositToYield(uint64 _poolId) internal {
        Pool storage pool = pools[_poolId];
        require(pool.principalAmount > 0, "No principal to deposit");

        IERC20 token = IERC20(pool.depositToken);
        IERC4626 yieldContract = IERC4626(pool.yieldContract);

        // Approve yield contract to spend tokens
        require(token.approve(pool.yieldContract, pool.principalAmount), "Approve failed");

        // Deposit to yield contract
        yieldContract.deposit(pool.principalAmount, address(this));
    }

    /**
     * @notice Returns total number of pools created
     */
    function getPoolCount() external view returns (uint64) {
        return poolCount;
    }

    /**
     * @notice Returns complete pool data
     * @param _poolId The pool ID
     */
    function getPool(uint64 _poolId) external view returns (Pool memory) {
        return pools[_poolId];
    }

    /**
     * @notice Returns all pools
     * @return Array of all pools
     */
    function getAllPools() external view returns (Pool[] memory) {
        Pool[] memory allPools = new Pool[](poolCount);
        for (uint64 i = 1; i <= poolCount; i++) {
            allPools[i - 1] = pools[i];
        }
        return allPools;
    }

    /**
     * @notice Returns user's total savings across all pools
     * @param _address User address
     */
    function getUserSavings(address _address) external view returns (uint256) {
        return savings[_address];
    }

    /**
     * @notice Returns participant data
     * @param _poolId The pool ID
     * @param _participantId The participant index (1-indexed)
     */
    function getParticipant(uint64 _poolId, uint32 _participantId)
        external
        view
        returns (Participant memory)
    {
        return poolParticipants[_poolId][_participantId];
    }

    /**
     * @notice Returns all participants in a pool
     * @param _poolId The pool ID
     * @return Array of all participants
     */
    function getAllParticipants(uint64 _poolId)
        external
        view
        returns (Participant[] memory)
    {
        Pool memory pool = pools[_poolId];
        require(pool.id != 0, "Pool does not exist");

        Participant[] memory participants = new Participant[](pool.participantsCount);
        for (uint32 i = 1; i <= pool.participantsCount; i++) {
            participants[i - 1] = poolParticipants[_poolId][i];
        }
        return participants;
    }
}

