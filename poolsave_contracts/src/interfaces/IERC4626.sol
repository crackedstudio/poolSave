// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IERC4626
 * @notice Minimal ERC4626 interface for yield vault integration
 */
interface IERC4626 {
    /**
     * @notice Returns the address of the underlying asset
     */
    function asset() external view returns (address);

    /**
     * @notice Returns the total amount of assets managed by the vault
     */
    function totalAssets() external view returns (uint256);

    /**
     * @notice Deposits assets into the vault and mints shares to receiver
     * @param assets The amount of assets to deposit
     * @param receiver The address to receive the shares
     * @return shares The amount of shares minted
     */
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    /**
     * @notice Withdraws assets from the vault
     * @param assets The amount of assets to withdraw
     * @param receiver The address to receive the assets
     * @param owner The owner of the shares
     * @return shares The amount of shares burned
     */
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);

    /**
     * @notice Converts assets to shares
     */
    function convertToShares(uint256 assets) external view returns (uint256);

    /**
     * @notice Converts shares to assets
     */
    function convertToAssets(uint256 shares) external view returns (uint256);
}

