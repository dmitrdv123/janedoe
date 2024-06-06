import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { parseAbiItem } from 'viem'

async function main() {
  const chainId = '0x19'
  const config = {
    chainId,
    blockchain: "cronos",
    transport: "http",
    rpcUrl: "https://evm.cronos.org",
    maxBlockRange: 1999
  }
  const fromBlock = BigInt('14270093')
  const toBlock = BigInt('14278093')
  const janeDoeAddress = '0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE'
  const abiEvent = parseAbiItem('event PayFrom(uint256 dt, address from, address indexed to, address token, uint256 amount, bytes paymentId)')

  const evmService = evmContainer.resolve<EvmService>('evmService')
  const events = await evmService.events(
    config,
    chainId,
    fromBlock,
    toBlock,
    janeDoeAddress,
    abiEvent
  )

  console.log(`found ${events.length} events`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
