// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NftPosition
 * @notice ERC721 NFT contract representing participant positions in a pool
 */
contract NftPosition is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    /**
     * @notice Mints a new NFT to the recipient
     * @param recipient The address to receive the NFT
     */
    function safeMint(address recipient) external {
        require(recipient != address(0), "Invalid recipient");
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
    }

    /**
     * @notice Returns the next token ID that will be minted
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}

