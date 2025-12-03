// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {NftPosition} from "../src/NftPosition.sol";

contract NftPositionTest is Test {
    NftPosition public nft;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        nft = new NftPosition("Pool NFT", "PNFT", owner);
    }

    function test_SafeMint_Success() public {
        vm.prank(owner);
        nft.safeMint(user);

        assertEq(nft.balanceOf(user), 1);
        assertEq(nft.ownerOf(1), user);
        assertEq(nft.nextTokenId(), 2);
    }

    function test_SafeMint_MultipleTokens() public {
        vm.startPrank(owner);
        nft.safeMint(user);
        nft.safeMint(user);
        nft.safeMint(user);
        vm.stopPrank();

        assertEq(nft.balanceOf(user), 3);
        assertEq(nft.ownerOf(1), user);
        assertEq(nft.ownerOf(2), user);
        assertEq(nft.ownerOf(3), user);
        assertEq(nft.nextTokenId(), 4);
    }

    function test_SafeMint_RevertsIfZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid recipient");
        nft.safeMint(address(0));
    }

    function test_ERC721Metadata() public view {
        assertEq(nft.name(), "Pool NFT");
        assertEq(nft.symbol(), "PNFT");
    }

    function test_Ownership() public view {
        assertEq(nft.owner(), owner);
    }
}

