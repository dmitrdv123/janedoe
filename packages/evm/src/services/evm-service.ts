import * as chains from 'viem/chains'
import { Address, createPublicClient, http, parseEventLogs, webSocket } from 'viem'
import { AbiEvent } from 'abitype'

import { BlockchainEvmClientConfig } from '@repo/dao/dist/src/interfaces/blockchain-evm-client-config'

import { EvmEvent } from '../interfaces/evm-event'

export interface EvmService {
  blockNumber(config: BlockchainEvmClientConfig | undefined, chainId: string): Promise<bigint>
  events<T>(config: BlockchainEvmClientConfig | undefined, chainId: string, fromBlock: bigint, toBlock: bigint, address: Address, event: AbiEvent): Promise<EvmEvent<T>[]>
}

export class EvmServiceImpl implements EvmService {
  public async blockNumber(config: BlockchainEvmClientConfig | undefined, chainId: string): Promise<bigint> {
    const client = this.createBlockchainPublicClient(chainId, config)
    return await client.getBlockNumber()
  }

  public async events<T>(config: BlockchainEvmClientConfig | undefined, chainId: string, fromBlock: bigint, toBlock: bigint, address: Address, event: AbiEvent): Promise<EvmEvent<T>[]> {
    if (fromBlock > toBlock) {
      return []
    }

    const client = this.createBlockchainPublicClient(chainId, config)

    const result: EvmEvent<T>[] = []
    const maxBlockRange = config?.maxBlockRange
      ? BigInt(config.maxBlockRange)
      : undefined

    let from: bigint = fromBlock
    while (from <= toBlock) {
      const to = maxBlockRange
        ? (
          from + maxBlockRange >= toBlock
            ? toBlock
            : from + maxBlockRange
        )
        : toBlock

      const logs = await client.getLogs({
        address,
        event,
        fromBlock: from,
        toBlock: to
      })

      const parsedLogs = await parseEventLogs({
        logs,
        abi: [event]
      })
      result.push(
        ...parsedLogs.map(log => (
          {
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            data: log.args as T
          }
        ))
      )

      from = to + BigInt(1)
    }

    return result
  }

  private createBlockchainPublicClient(chainId: string, config: BlockchainEvmClientConfig | undefined) {
    const chain = Object.values(chains).find(chain => 'id' in chain && chain.id === Number(chainId))
    return config
      ? createPublicClient({
        chain,
        transport: config.transport === 'http'
          ? http(config.rpcUrl, {
            /** The max number of times to retry. */
            retryCount: 5,
            /** The base delay (in ms) between retries. */
            retryDelay: 1000,
            /** The timeout (in ms) for the HTTP request. Default: 10_000 */
            timeout: 30_000
          })
          : webSocket(config.rpcUrl, {
            /** The max number of times to retry. */
            retryCount: 5,
            /** The base delay (in ms) between retries. */
            retryDelay: 1000,
            /** The timeout (in ms) for the HTTP request. Default: 10_000 */
            timeout: 30_000
          }),
      })
      : createPublicClient({
        chain,
        transport: http(),
      })
  }
}
