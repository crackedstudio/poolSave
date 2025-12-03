// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title INftPosition
 * @notice Interface for NFT position contracts representing pool membership
 */
interface INftPosition {
    /**
     * @notice Mints a new NFT to the recipient
     * @param recipient The address to receive the NFT
     */
    function safeMint(address recipient) external;

    /**
     * @notice Returns the balance of NFTs owned by an account
     * @param account The address to query
     * @return The number of NFTs owned
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @notice Returns the owner of a specific token ID
     * @param tokenId The token ID to query
     * @return The owner address
     */
    function ownerOf(uint256 tokenId) external view returns (address);
}

