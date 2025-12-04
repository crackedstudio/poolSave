# PoolSave Contracts

A decentralized savings platform built on Ethereum that enables community-based rotating savings pools with collective yield generation. The system combines traditional rotating savings circle concepts (ajo, esusu, tontines, juntas) with blockchain technology to provide transparency, automation, and yield generation.

## 🎯 Features

-   **Pool Creation**: Users can create savings pools with configurable parameters
-   **NFT-Based Membership**: Each participant receives an NFT representing their position in the pool
-   **Automated Yield Generation**: Funds are automatically deployed to yield-generating strategies when pools are full
-   **Transparent Tracking**: All contributions, participants, and pool states are recorded on-chain
-   **Comprehensive Query Functions**: Easy access to pool data, participants, and user savings

## 📋 Table of Contents

-   [Architecture](#architecture)
-   [Contracts](#contracts)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Testing](#testing)
-   [Project Structure](#project-structure)
-   [Development](#development)
-   [Security](#security)
-   [License](#license)

## 🏗️ Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PoolSave Ecosystem                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ PoolSaveVault│────────▶│ NFT Position │                 │
│  │   (Main)     │         │ Contract     │                 │
│  │              │         │ (ERC721)     │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                                                      │
│         │ Deploys                                            │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ ERC20 Token  │         │ Yield Contract│                 │
│  │ (Deposit)    │────────▶│ (ERC4626)     │                 │
│  └──────────────┘         └──────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Workflow

1. **Pool Creation**: User creates a pool with specified parameters (contribution amount, max participants, deposit token, yield contract)
2. **NFT Deployment**: A new ERC721 NFT contract is deployed for the pool
3. **Participant Joining**: Users join by depositing tokens and receive an NFT
4. **Yield Deployment**: When pool reaches capacity, funds are automatically deployed to the ERC4626 yield vault

## 📦 Contracts

### PoolSaveVault

The main contract managing all savings pools, participants, and interactions.

**Key Functions**:

-   `createPool()` - Creates a new savings pool and deploys NFT contract
-   `joinPool()` - Allows users to join pools by depositing tokens
-   `getPool()` - Returns pool data
-   `getAllPools()` - Returns all pools
-   `getParticipant()` - Returns participant data
-   `getAllParticipants()` - Returns all participants in a pool
-   `getUserSavings()` - Returns user's total savings across all pools

### NftPosition

ERC721 NFT contract representing participant positions in a pool. Each pool has its own NFT contract instance.

**Key Functions**:

-   `safeMint()` - Mints NFT to recipient
-   Standard ERC721 functions (inherited from OpenZeppelin)

### Data Structures

-   **Pool**: Contains pool configuration, state, and metadata
-   **Participant**: Tracks participant address, deposits, and claim status

## 🚀 Installation

### Prerequisites

-   [Foundry](https://book.getfoundry.sh/getting-started/installation)
-   Solidity ^0.8.13

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd poolsave_contracts

# Install dependencies
forge install

# Build contracts
forge build
```

## 💻 Usage

### Build

```bash
forge build
```

### Test

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vv

# Run specific test file
forge test --match-path test/PoolSaveVault.t.sol

# Run with gas report
forge test --gas-report
```

### Format

```bash
forge fmt
```

### Gas Snapshots

```bash
forge snapshot
```

### Deploy

```bash
# Deploy to a network
forge script script/Deploy.s.sol:DeployScript --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast
```

## 🧪 Testing

The project includes comprehensive test coverage using Foundry's testing framework.

### Test Coverage

-   ✅ **26 tests passing** (19 for PoolSaveVault, 5 for NftPosition, 2 for Counter)
-   ✅ Pool creation (success cases, validation failures)
-   ✅ Participant joining (success cases, edge cases)
-   ✅ Yield deployment when pools fill
-   ✅ All getter functions
-   ✅ Error conditions and edge cases

### Running Tests

```bash
# Run all tests
forge test

# Run with detailed output
forge test -vvv

# Run specific test
forge test --match-test test_CreatePool_Success
```

### Test Files

-   `test/PoolSaveVault.t.sol` - Main vault contract tests
-   `test/NftPosition.t.sol` - NFT contract tests
-   `test/mocks/MockERC20.sol` - Mock ERC20 token for testing
-   `test/mocks/MockERC4626.sol` - Mock ERC4626 vault for testing

## 📁 Project Structure

```
poolsave_contracts/
├── src/
│   ├── interfaces/
│   │   ├── IERC20.sol          # ERC20 interface
│   │   ├── IERC4626.sol        # ERC4626 yield vault interface
│   │   └── INftPosition.sol    # NFT position interface
│   ├── types/
│   │   └── PoolSaveTypes.sol   # Pool and Participant structs
│   ├── PoolSaveVault.sol       # Main vault contract
│   └── NftPosition.sol         # NFT position contract
├── test/
│   ├── mocks/
│   │   ├── MockERC20.sol       # Mock ERC20 token
│   │   └── MockERC4626.sol     # Mock ERC4626 vault
│   ├── PoolSaveVault.t.sol     # Vault contract tests
│   └── NftPosition.t.sol       # NFT contract tests
├── script/
│   └── Counter.s.sol           # Example deployment script
├── foundry.toml                 # Foundry configuration
└── README.md                    # This file
```

## 🔧 Development

### Development Workflow

1. **Write Tests First** (TDD approach)
2. **Implement Contracts**
3. **Run Tests**: `forge test`
4. **Format Code**: `forge fmt`
5. **Check Linting**: `forge build`

### Configuration

The project uses Foundry with the following configuration:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
via_ir = true
optimizer = true
optimizer_runs = 200
```

### Dependencies

-   **OpenZeppelin Contracts**: v5.5.0
    -   ERC721 implementation
    -   Ownable access control
-   **Forge Std**: Testing framework

## 🔒 Security

### Implemented Security Features

-   ✅ Input validation (zero address checks, amount validation)
-   ✅ State validation before operations
-   ✅ Access control and caller validation
-   ✅ Duplicate participation prevention
-   ✅ Pool capacity enforcement
-   ✅ Atomic state updates

### Security Considerations

-   ⚠️ Consider adding ReentrancyGuard for external calls
-   ⚠️ Consider implementing Pausable for emergency stops
-   ⚠️ Consider adding time-based restrictions
-   ⚠️ Consider restricting NFT minting to vault contract only

### Audit Status

⚠️ **Not yet audited** - This code is in development and has not been audited. Use at your own risk.

## 📚 Documentation

-   [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed implementation documentation
-   [Architecture Specification](./ARCHITECTURE.md) - Complete architecture documentation (if available)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   [OpenZeppelin](https://openzeppelin.com/) for battle-tested contract libraries
-   [Foundry](https://book.getfoundry.sh/) for the excellent development framework

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This project is in active development. Use at your own risk and always conduct thorough testing before deploying to mainnet.
