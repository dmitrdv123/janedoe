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
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    optimism: {
      url: 'https://optimism-rpc.publicnode.com',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    base: {
      url: 'https://mainnet.base.org/',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    linea: {
      url: 'https://rpc.linea.build',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    scroll: {
      url: 'https://rpc.scroll.io',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    cronos: {
      url: 'https://evm.cronos.org',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    },
    eth: {
      url: 'https://rpc.ankr.com/eth',
      accounts: process.env.SIGNER ? [process.env.SIGNER] : undefined
    }
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY ?? '',
      polygon: process.env.POLYGONSCAN_API_KEY ?? '',
      arbitrumOne: process.env.ARBISCAN_API_KEY ?? '',
      optimisticEthereum: process.env.OPTIMISMSCAN_API_KEY ?? '',
      base: process.env.BASESCAN_API_KEY ?? '',
      linea: process.env.LINEASCAN_API_KEY ?? '',
      cronos: process.env.CRONOSSCAN_API_KEY ?? '',
      mainnet: process.env.ETHERSCAN_API_KEY ?? '',
      avalanche: process.env.SNOWTRACE_API_KEY ?? ''
    },
    customChains: [
      {
        network: "cronos",
        chainId: 25,
        urls: {
          apiURL: "https://api.cronoscan.com/api",
          browserURL: "https://cronoscan.com"
        }
      },
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build"
        }
      }
    ]
  }
}

export default config
