import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'local'}`.trim() })

import '@nomicfoundation/hardhat-toolbox'
import '@matterlabs/hardhat-zksync'
import { HardhatUserConfig } from 'hardhat/config'

import './src/app-config'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  zksolc: {
    version: 'latest',
    settings: {},
  },
  defaultNetwork: 'zksyncInMemoryNode',
  networks: {
    zksync: {
      url: 'https://mainnet.era.zksync.io',
      ethNetwork: 'mainnet',
      zksync: true,
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
    },
    zksyncSepoliaTestnet: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'sepolia',
      zksync: true,
      verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
    },
    zksyncDockerizedNode: {
      url: 'http://localhost:3050',
      ethNetwork: 'http://localhost:8545',
      zksync: true
    },
    zksyncInMemoryNode: {
      url: 'http://127.0.0.1:8011',
      ethNetwork: 'localhost', // in-memory node doesn't support eth node; removing this line will cause an error
      zksync: true
    },
    hardhat: {
      zksync: true,
    },
  },
}

export default config
