import * as chains from 'viem/chains'
import { parseAbiItem } from 'viem'
import { Address, GetLogsReturnType, createPublicClient, http, parseEventLogs, webSocket } from 'viem'

import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'

import JaneDoe from '../artifacts/contracts/JaneDoe.sol/JaneDoe.json'

async function main() {
  const chain = Object.values(chains).find(chain => 'id' in chain && chain.id === Number('0x1'))

  const client = createPublicClient({
    chain,
    transport: http('https://ethereum-rpc.publicnode.com')
  })

  const filter = await client.createEventFilter({
    address: '0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE',
    event: {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dt",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "paymentId",
          "type": "bytes"
        }
      ],
      "name": "PayFrom",
      "type": "event"
    },
    fromBlock: BigInt('19788009'),
    toBlock: BigInt('19788011'),
  })
  const events = await client.getFilterLogs({ filter })
  const events = await client.getLogs({
    address: '0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE',
    event: parseAbiItem('event PayFrom(uint256 dt, address from, address indexed to, address token, uint256 amount, bytes paymentId)'),
    fromBlock: BigInt('19788009'),
    toBlock: BigInt('19788010')
  })

  // const evmService = evmContainer.resolve<EvmService>('evmService')
  // const events = await evmService.events(
  //   {
  //     chainId: "0x1",
  //     blockchain: "ethereum",
  //     transport: "http",
  //     rpcUrl: "https://ethereum-rpc.publicnode.com",
  //     maxBlockRange: 49999
  //   },
  //   '0x1',
  //   BigInt('19788009'),
  //   BigInt('19788011')
  // )

  console.log(`found ${events.length} events`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
