import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'local'}`.trim() })

import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks : {
    hardhat: {
      hardfork: process.env.CODE_COVERAGE ? 'berlin' : 'london',
      forking: {
        enabled: process.env.FORKING === 'true',
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
      }
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined,
      chainId: 56
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined,
      chainId: 137
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined,
      chainId: 42161
    },
    optimism: {
      url: 'https://mainnet.optimism.io',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined,
      chainId: 10
    },
    base: {
      url: 'https://mainnet.base.org/',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined,
      chainId: 8453
    }
  }
}

export default config
