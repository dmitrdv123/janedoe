require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`.trim() })

const port = process.env.HOST_PORT || 9090

module.exports = {
  defaultNetwork: 'tronDevelopment',
  networks: {
    tron: {
      privateKey: process.env.SIGNER,
      userFeePercentage: 100,
      feeLimit: 9000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '0x2b6653dc'
    },
    tronShasta: {
      privateKey: process.env.SIGNER,
      userFeePercentage: 50,
      feeLimit: 9000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '0x94a9059e'
    },
    tronNile: {
      privateKey: process.env.SIGNER,
      userFeePercentage: 100,
      feeLimit: 9000 * 1e6,
      fullHost: 'https://nile.trongrid.io',
      network_id: '0xcd8690dc'
    },
    tronDevelopment: {
      privateKey: process.env.SIGNER,
      userFeePercentage: 0,
      feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:' + port,
      network_id: '9'
    },
    compilers: {
      solc: {
        version: '0.8.20'
      }
    },
  },
  // solc compiler optimize
  solc: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200
  //   },
  //   evmVersion: 'istanbul'
  }
}
