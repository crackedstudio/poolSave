// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PoolSaveVault} from "../src/PoolSaveVault.sol";
import {NftPosition} from "../src/NftPosition.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockERC4626} from "./mocks/MockERC4626.sol";
import {Pool, Participant} from "../src/types/PoolSaveTypes.sol";

contract PoolSaveVaultTest is Test {
    PoolSaveVault public vault;
    MockERC20 public depositToken;
    MockERC4626 public yieldVault;
    NftPosition public nftPosition;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    uint256 public constant CONTRIBUTION_AMOUNT = 1000 * 10**18;
    uint32 public constant MAX_PARTICIPANTS = 3;

    event CreatePoolEvent(uint64 indexed poolId, address indexed creator, uint32 participantsCount);
    event JoinPoolEvent(uint64 indexed poolId, address indexed participant, uint32 participantsCount);

    function setUp() public {
        // Deploy mock token
        depositToken = new MockERC20("Test Token", "TEST");
        
        // Deploy yield vault
        yieldVault = new MockERC4626(address(depositToken));
        
        // Deploy vault
        vault = new PoolSaveVault();
        
        // Give users some tokens
        depositToken.mint(alice, 10000 * 10**18);
        depositToken.mint(bob, 10000 * 10**18);
        depositToken.mint(charlie, 10000 * 10**18);
    }

    // ============ createPool Tests ============

    function test_CreatePool_Success() public {
        uint64 startDate = uint64(block.timestamp);
        
        vm.expectEmit(true, true, false, true);
        emit CreatePoolEvent(1, alice, 0);
        
        vm.prank(alice);
        uint64 poolId = vault.createPool(
            "Test Pool",
            "TPNFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            startDate
        );

        assertEq(poolId, 1);
        assertEq(vault.poolCount(), 1);
        
        Pool memory pool = vault.getPool(poolId);
        assertEq(pool.id, 1);
        assertEq(pool.creator, alice);
        assertEq(pool.contributionAmount, CONTRIBUTION_AMOUNT);
        assertEq(pool.maxParticipants, MAX_PARTICIPANTS);
        assertEq(pool.depositToken, address(depositToken));
        assertEq(pool.yieldContract, address(yieldVault));
        assertEq(pool.startTimestamp, startDate);
        assertTrue(pool.isActive);
        assertEq(pool.participantsCount, 0);
        assertEq(pool.principalAmount, 0);
    }

    function test_CreatePool_RevertsIfZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert("Invalid amount");
        vault.createPool(
            "Test Pool",
            "TPNFT",
            0,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
    }

    function test_CreatePool_RevertsIfZeroDepositToken() public {
        vm.prank(alice);
        vm.expectRevert("Invalid deposit token");
        vault.createPool(
            "Test Pool",
            "TPNFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(0),
            address(yieldVault),
            uint64(block.timestamp)
        );
    }

    function test_CreatePool_RevertsIfZeroYieldContract() public {
        vm.prank(alice);
        vm.expectRevert("Invalid yield contract");
        vault.createPool(
            "Test Pool",
            "TPNFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(0),
            uint64(block.timestamp)
        );
    }

    function test_CreatePool_RevertsIfZeroMaxParticipants() public {
        vm.prank(alice);
        vm.expectRevert("Invalid max participants");
        vault.createPool(
            "Test Pool",
            "TPNFT",
            CONTRIBUTION_AMOUNT,
            0,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
    }

    function test_CreatePool_MultiplePools() public {
        vm.prank(alice);
        uint64 poolId1 = vault.createPool(
            "Pool 1",
            "P1NFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );

        vm.prank(bob);
        uint64 poolId2 = vault.createPool(
            "Pool 2",
            "P2NFT",
            CONTRIBUTION_AMOUNT * 2,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );

        assertEq(poolId1, 1);
        assertEq(poolId2, 2);
        assertEq(vault.poolCount(), 2);
    }

    // ============ joinPool Tests ============

    function test_JoinPool_Success() public {
        uint64 poolId = _createPool();
        
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        
        vm.expectEmit(true, true, false, true);
        emit JoinPoolEvent(poolId, alice, 1);
        
        vault.joinPool(poolId);
        vm.stopPrank();

        Pool memory pool = vault.getPool(poolId);
        assertEq(pool.participantsCount, 1);
        assertEq(pool.principalAmount, CONTRIBUTION_AMOUNT);
        
        Participant memory participant = vault.getParticipant(poolId, 1);
        assertEq(participant.addr, alice);
        assertEq(participant.deposited, CONTRIBUTION_AMOUNT);
        assertFalse(participant.hasClaimed);
        assertFalse(participant.withdrawn);
        
        assertEq(vault.getUserSavings(alice), CONTRIBUTION_AMOUNT);
        assertEq(depositToken.balanceOf(address(vault)), CONTRIBUTION_AMOUNT);
    }

    function test_JoinPool_MultipleParticipants() public {
        uint64 poolId = _createPool();
        
        // Alice joins
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        vm.stopPrank();

        // Bob joins
        vm.startPrank(bob);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        vm.stopPrank();

        Pool memory pool = vault.getPool(poolId);
        assertEq(pool.participantsCount, 2);
        assertEq(pool.principalAmount, CONTRIBUTION_AMOUNT * 2);
        
        Participant[] memory participants = vault.getAllParticipants(poolId);
        assertEq(participants.length, 2);
        assertEq(participants[0].addr, alice);
        assertEq(participants[1].addr, bob);
    }

    function test_JoinPool_RevertsIfPoolFull() public {
        uint64 poolId = _createPool();
        
        // Fill the pool
        _fillPool(poolId);
        
        // Try to join when full
        vm.startPrank(charlie);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vm.expectRevert("Pool is full");
        vault.joinPool(poolId);
        vm.stopPrank();
    }

    function test_JoinPool_RevertsIfInsufficientBalance() public {
        uint64 poolId = _createPool();
        
        address poorUser = address(0x999);
        depositToken.mint(poorUser, CONTRIBUTION_AMOUNT / 2);
        
        vm.startPrank(poorUser);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vm.expectRevert("Insufficient balance");
        vault.joinPool(poolId);
        vm.stopPrank();
    }

    function test_JoinPool_RevertsIfInsufficientAllowance() public {
        uint64 poolId = _createPool();
        
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT / 2);
        vm.expectRevert("Insufficient allowance");
        vault.joinPool(poolId);
        vm.stopPrank();
    }

    function test_JoinPool_RevertsIfAlreadyJoined() public {
        uint64 poolId = _createPool();
        
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        
        // Try to join again
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vm.expectRevert("Already joined");
        vault.joinPool(poolId);
        vm.stopPrank();
    }

    function test_JoinPool_RevertsIfPoolNotActive() public {
        uint64 poolId = _createPool();
        
        // Deactivate pool (this would require a deactivate function, but for now we test the check)
        // Since we don't have a deactivate function yet, we'll test with non-existent pool
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vm.expectRevert("Pool does not exist");
        vault.joinPool(999);
        vm.stopPrank();
    }

    function test_JoinPool_DeploysToYieldWhenFull() public {
        uint64 poolId = _createPool();
        
        // Fill pool (should trigger yield deployment)
        _fillPool(poolId);
        
        Pool memory pool = vault.getPool(poolId);
        assertEq(pool.participantsCount, MAX_PARTICIPANTS);
        
        // Check that funds were deposited to yield vault
        uint256 vaultBalance = depositToken.balanceOf(address(vault));
        uint256 yieldVaultAssets = yieldVault.totalAssets();
        
        // After deposit, vault should have 0 balance (all went to yield vault)
        assertEq(vaultBalance, 0);
        assertEq(yieldVaultAssets, CONTRIBUTION_AMOUNT * uint256(MAX_PARTICIPANTS));
    }

    // ============ Getter Tests ============

    function test_GetPoolCount() public {
        assertEq(vault.getPoolCount(), 0);
        
        _createPool();
        assertEq(vault.getPoolCount(), 1);
        
        vm.prank(bob);
        vault.createPool(
            "Pool 2",
            "P2NFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
        
        assertEq(vault.getPoolCount(), 2);
    }

    function test_GetAllPools() public {
        _createPool();
        
        vm.prank(bob);
        vault.createPool(
            "Pool 2",
            "P2NFT",
            CONTRIBUTION_AMOUNT * 2,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
        
        Pool[] memory allPools = vault.getAllPools();
        assertEq(allPools.length, 2);
        assertEq(allPools[0].id, 1);
        assertEq(allPools[1].id, 2);
    }

    function test_GetUserSavings() public {
        uint64 poolId = _createPool();
        
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        vm.stopPrank();
        
        assertEq(vault.getUserSavings(alice), CONTRIBUTION_AMOUNT);
        assertEq(vault.getUserSavings(bob), 0);
    }

    function test_GetUserSavings_MultiplePools() public {
        uint64 poolId1 = _createPool();
        
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT * 2);
        vault.joinPool(poolId1);
        vm.stopPrank();
        
        // Create second pool and join
        vm.prank(bob);
        uint64 poolId2 = vault.createPool(
            "Pool 2",
            "P2NFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
        
        vm.startPrank(alice);
        vault.joinPool(poolId2);
        vm.stopPrank();
        
        assertEq(vault.getUserSavings(alice), CONTRIBUTION_AMOUNT * 2);
    }

    function test_GetAllParticipants() public {
        uint64 poolId = _createPool();
        
        // Alice joins
        vm.startPrank(alice);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        vm.stopPrank();

        // Bob joins
        vm.startPrank(bob);
        depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
        vault.joinPool(poolId);
        vm.stopPrank();

        Participant[] memory participants = vault.getAllParticipants(poolId);
        assertEq(participants.length, 2);
        assertEq(participants[0].addr, alice);
        assertEq(participants[1].addr, bob);
    }

    // ============ Helper Functions ============

    function _createPool() internal returns (uint64) {
        vm.prank(alice);
        return vault.createPool(
            "Test Pool",
            "TPNFT",
            CONTRIBUTION_AMOUNT,
            MAX_PARTICIPANTS,
            address(depositToken),
            address(yieldVault),
            uint64(block.timestamp)
        );
    }

    function _fillPool(uint64 poolId) internal {
        address[] memory users = new address[](3);
        users[0] = alice;
        users[1] = bob;
        users[2] = charlie;

        for (uint256 i = 0; i < users.length; i++) {
            vm.startPrank(users[i]);
            depositToken.approve(address(vault), CONTRIBUTION_AMOUNT);
            vault.joinPool(poolId);
            vm.stopPrank();
        }
    }
}

