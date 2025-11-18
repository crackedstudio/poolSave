// Token contract addresses for different networks
// These would be the actual deployed contract addresses

export const TOKEN_ADDRESSES = {
  // Mainnet addresses (example - replace with actual addresses)
  mainnet: {
    USDT: '0x...', // Replace with actual USDT contract address
    USDC:  '0x...', // Replace with actual USDC contract address  
    BTC: '0x...',  // Replace with actual BTC contract address
  },
  // Testnet addresses (example - replace with actual addresses)
  testnet: {
    USDT: '0x008d4c6451c45ef46eff81b13e1a3f2237642b97e528ce1ae1d8b8ee2b267e8d', // Replace with actual testnet USDT contract address
    USDC: '0x0054bd06a78db79f274984edf6907148c57af42f06ffd9a764ffe40ed9e0129b', // Replace with actual testnet USDC contract address
    BTC: '0x04861ba938aed21f2cd7740acd3765ac4d2974783a3218367233de0153490cb6',  // Replace with actual testnet BTC contract address
  },
  // Sepolia testnet addresses (example - replace with actual addresses)
  sepolia: {
    USDT: '0x008d4c6451c45ef46eff81b13e1a3f2237642b97e528ce1ae1d8b8ee2b267e8d', // Replace with actual Sepolia USDT contract address
    USDC: '0x0054bd06a78db79f274984edf6907148c57af42f06ffd9a764ffe40ed9e0129b', // Replace with actual Sepolia USDC contract address
    BTC: '0x04861ba938aed21f2cd7740acd3765ac4d2974783a3218367233de0153490cb6'  // Replace with actual Sepolia BTC contract address
  }
}

export const getTokenAddress = (token: 'USDT' | 'USDC' | 'BTC', network: 'mainnet' | 'testnet' | 'sepolia' = 'sepolia'): string => {
  return TOKEN_ADDRESSES[network][token]
}

// Yield contract addresses for different protocols and networks
export const YIELD_CONTRACT_ADDRESSES = {
  // Mainnet addresses (example - replace with actual addresses)
  mainnet: {
    usdc: '0x...', // Replace with actual Compound contract address
    usdt: '0x...',      // Replace with actual Aave contract address
    btc: '0x...', // Replace with actual Yield Protocol contract address
  },
  // Testnet addresses (example - replace with actual addresses)
  testnet: {
    usdc: '0x0341e472cdfe6fc6a6d9684d26f1028b177c48a52ffd4c847fea60e66b21a455', // Replace with actual testnet Compound contract address
    usdt: '0x03638b8f85f909e34d44fa3dac5b55ec85cd60d0cdd15e2bd65397e4732228b1',      // Replace with actual testnet Aave contract address
    btc: '0x033d52ef1746ab58c5a22f8e4d80eaaf7c5a08fcfaa6c5e5365680d0ed482f34', // Replace with actual testnet Yield Protocol contract address
  },
  // Sepolia testnet addresses (example - replace with actual addresses)
  sepolia: {
    usdc: '0x0341e472cdfe6fc6a6d9684d26f1028b177c48a52ffd4c847fea60e66b21a455', // Replace with actual Sepolia Compound contract address
    usdt: '0x03638b8f85f909e34d44fa3dac5b55ec85cd60d0cdd15e2bd65397e4732228b1',      // Replace with actual Sepolia Aave contract address
    btc: '0x033d52ef1746ab58c5a22f8e4d80eaaf7c5a08fcfaa6c5e5365680d0ed482f34', // Replace with actual Sepolia Yield Protocol contract address
  }
}

export const getYieldContractAddress = (protocol: 'usdc' | 'usdt' | 'btc', network: 'mainnet' | 'testnet' | 'sepolia' = 'sepolia'): string => {
  return YIELD_CONTRACT_ADDRESSES[network][protocol]
}
