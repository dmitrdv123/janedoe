import { Chain } from 'viem'

export const tron: Chain = {
  id: 728126428,
  name: 'Tron',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: {
      http: ['https://api.trongrid.io/jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://tronscan.org',
      apiUrl: 'https://apilist.tronscanapi.com',
    },
  }
}
