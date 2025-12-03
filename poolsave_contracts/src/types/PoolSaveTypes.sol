// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title PoolSaveTypes
 * @notice Data structures and events for PoolSave contracts
 */

/**
 * @notice Pool structure representing a savings pool
 */
struct Pool {
    uint64 id;                      // Unique pool identifier
    address creator;                // Address that created the pool
    uint32 participantsCount;       // Current number of participants
    uint32 maxParticipants;         // Maximum allowed participants
    uint256 contributionAmount;     // Required deposit per participant
    uint256 principalAmount;        // Total principal collected
    uint256 totalYieldDistributed;  // Cumulative yield distributed
    uint64 startTimestamp;          // Pool creation timestamp
    uint64 duration;                // Pool duration (if applicable)
    uint64 lastHarvestTimestamp;   // Last yield harvest time
    uint32 roundsCompleted;         // Number of completed cycles
    address depositToken;           // ERC20 token address
    address positionNft;           // NFT contract address for this pool
    bool isActive;                 // Pool status flag
    address yieldContract;          // ERC4626 yield vault address
}

/**
 * @notice Participant structure representing a pool participant
 */
struct Participant {
    address addr;       // Participant's address
    uint256 deposited;  // Amount deposited
    bool hasClaimed;    // Whether yield has been claimed
    bool withdrawn;     // Whether principal has been withdrawn
}

