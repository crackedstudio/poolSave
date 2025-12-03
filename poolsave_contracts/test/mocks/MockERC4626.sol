// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC4626} from "../../src/interfaces/IERC4626.sol";
import {IERC20} from "../../src/interfaces/IERC20.sol";

/**
 * @title MockERC4626
 * @notice Mock ERC4626 vault for testing
 */
contract MockERC4626 is IERC4626, ERC20 {
    IERC20 public immutable assetToken;
    uint256 private _totalAssets;

    constructor(address _asset) ERC20("Mock Vault Shares", "MVS") {
        assetToken = IERC20(_asset);
    }

    function asset() external view override returns (address) {
        return address(assetToken);
    }

    function totalAssets() external view override returns (uint256) {
        return _totalAssets;
    }

    function deposit(uint256 assets, address receiver) external override returns (uint256 shares) {
        require(assets > 0, "Invalid amount");
        require(assetToken.transferFrom(msg.sender, address(this), assets), "Transfer failed");
        
        _totalAssets += assets;
        shares = convertToShares(assets);
        _mint(receiver, shares);
        
        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner) external override returns (uint256 shares) {
        require(assets > 0, "Invalid amount");
        shares = convertToShares(assets);
        
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            require(allowed >= shares, "Insufficient allowance");
            _spendAllowance(owner, msg.sender, shares);
        }
        
        _burn(owner, shares);
        _totalAssets -= assets;
        require(assetToken.transfer(receiver, assets), "Transfer failed");
        
        return shares;
    }

    function convertToShares(uint256 assets) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0 || _totalAssets == 0) {
            return assets; // 1:1 ratio initially
        }
        return (assets * supply) / _totalAssets;
    }

    function convertToAssets(uint256 shares) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return shares;
        }
        return (shares * _totalAssets) / supply;
    }
}

