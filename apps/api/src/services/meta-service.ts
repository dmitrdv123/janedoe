import { MetaResponse, Token, TransactionType } from 'rango-sdk-basic'

import { MetaDao } from '@repo/dao/dist/src/dao/meta.dao'
import appConfig from '@repo/common/dist/src/app-config'

import { META_SAVING_SAMPLING_SECONDS } from '../constants'
import { TokenByTimestamp } from '../interfaces/token'
import { logger } from '../utils/logger'
import { isNullOrEmptyOrWhitespaces, unminifyAndCorrectToken } from '../utils/utils'
import { RangoService } from './rango-service'

export interface MetaService {
  meta(): Promise<MetaResponse>
  loadTokens(tokens: TokenByTimestamp[]): Promise<(Token | undefined)[]>
  saveTokens(timestamp: number, tokens: Token[]): Promise<void>
}

export class MetaServiceImpl implements MetaService {
  public constructor(
    private rangoService: RangoService,
    private metaDao: MetaDao
  ) { }

  public async meta(): Promise<MetaResponse> {
    logger.debug(`MetaService: start to find meta`)

    logger.debug('MetaService: start to retrieve meta')
    const meta = await this.retrieveMeta()
    logger.debug('MetaService: end to retrieve meta')

    if (!meta) {
      throw new Error('MetaService: meta not defined')
    }

    return meta
  }

  public async loadTokens(tokensByTimestamp: TokenByTimestamp[]): Promise<(Token | undefined)[]> {
    logger.debug(`MetaService: start to find tokens`)
    logger.debug(tokensByTimestamp)

    const tokensByTimestampSampling = tokensByTimestamp.map(
      tokenByTimestamp => ({
        blockchain: tokenByTimestamp.blockchain,
        address: tokenByTimestamp.address,
        timestamp: Math.floor(tokenByTimestamp.timestamp / META_SAVING_SAMPLING_SECONDS) * META_SAVING_SAMPLING_SECONDS
      })
    )

    const timestampNow = Math.floor(Date.now() / 1000)
    const timestampNowIndex = tokensByTimestampSampling.findIndex(
      item => Math.abs(item.timestamp - timestampNow) <= META_SAVING_SAMPLING_SECONDS
    )
    if (timestampNowIndex !== -1) {
      await this.requestMeta()
    }

    const tokens = await Promise.all(
      tokensByTimestampSampling.map(tokenByTimestampSampling => this.retrieveToken(tokenByTimestampSampling))
    )
    logger.debug('MetaService: end to find tokens')
    logger.debug(tokens)

    return tokens
  }

  public async saveTokens(timestamp: number, tokens: Token[]): Promise<void> {
    logger.debug(`MetaService: start to save ${tokens.length} tokens`)
    const timestampSampling = Math.floor(timestamp / META_SAVING_SAMPLING_SECONDS) * META_SAVING_SAMPLING_SECONDS
    await this.metaDao.saveTokens(timestampSampling, tokens)
    logger.debug('MetaService: end to save tokens')
  }

  private async retrieveMeta(): Promise<MetaResponse> {
    logger.debug('MetaService: start to load meta from api')
    const meta = await this.requestMeta()
    logger.debug('MetaService: end to load meta from api')
    return meta
  }

  private async requestMeta(): Promise<MetaResponse> {
    const meta = await this.rangoService.meta()
    const modifiedMeta = appConfig.IS_DEV ? this.modifyMetaForLocal(meta) : meta

    const blockchains = Object.fromEntries(
      modifiedMeta.blockchains.map(blockchain => [blockchain.name.toLocaleLowerCase(), blockchain])
    )

    return {
      blockchains: modifiedMeta.blockchains,
      tokens: modifiedMeta.tokens
        .filter(token => !(token as any).is && (token as any).p)
        .map(token => unminifyAndCorrectToken(token, blockchains)),
      swappers: modifiedMeta.swappers
    }
  }

  private modifyMetaForLocal(meta: any): MetaResponse {
    const eth = meta.tokens.find((item: { b: string; s: string }) => item.b === 'ETH' && item.s === 'ETH')
    const usdt = meta.tokens.find((item: { b: string; s: string }) => item.b === 'ETH' && item.s === 'USDT')
    const usdc = meta.tokens.find((item: { b: string; s: string }) => item.b === 'ETH' && item.s === 'USDC')

    meta.tokens.push({
      b: 'Hardhat',
      s: 'ETH',
      i: 'https://api.rango.exchange/i/MTyH5i',
      p: eth === undefined ? 1 : eth.p,
      d: 18,
      n: 'Ether',
      ip: true,
      ss: [
      ]
    })

    meta.tokens.push({
      b: 'Hardhat',
      s: 'USDT',
      i: 'https://api.rango.exchange/i/6837hX',
      a: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      p: usdt === undefined ? 1.001 : usdt.p,
      d: 6,
      n: 'USDT',
      ip: true,
      cu: 'https://api.rango.exchange/i/zsiskx',
      ss: [
      ]
    })

    meta.tokens.push({
      b: 'Hardhat',
      s: 'USDC',
      i: 'https://api.rango.exchange/i/toXKGV',
      a: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      p: usdc === undefined ? 1.001 : usdc.p,
      d: 18,
      n: 'USDC',
      ip: true,
      cu: 'https://api.rango.exchange/i/zsiskx',
      ss: [
      ]
    })

    meta.blockchains.push({
      name: 'Hardhat',
      defaultDecimals: 18,
      addressPatterns: [
        '^(0x)[0-9A-Fa-f]{40}$'
      ],
      feeAssets: [
        {
          blockchain: 'Hardhat',
          symbol: 'ETH',
          address: null
        }
      ],
      logo: 'https://api.rango.exchange/blockchains/ethereum.svg',
      displayName: 'Hardhat',
      shortName: 'Hardhat',
      sort: 3,
      color: '#ecf0f1',
      enabled: true,
      type: TransactionType.EVM,
      chainId: '0x7a69',
      info: {
        infoType: 'EvmMetaInfo',
        chainName: 'Hardhat',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: [
          'http://127.0.0.1:8545'
        ],
        blockExplorerUrls: [
          'https://etherscan.io'
        ],
        addressUrl: 'https://etherscan.io/address/{wallet}',
        transactionUrl: 'https://etherscan.io/tx/{txHash}'
      }
    })

    return meta
  }

  private async retrieveToken(tokenByTimestamp: TokenByTimestamp): Promise<Token | undefined> {
    const timestampSampling = Math.floor(tokenByTimestamp.timestamp / META_SAVING_SAMPLING_SECONDS) * META_SAVING_SAMPLING_SECONDS

    logger.debug(`MetaService: start to load token from ${tokenByTimestamp.blockchain} with address ${tokenByTimestamp.address} by timestamp ${timestampSampling}`)
    const tokens = await this.metaDao.listTokens(timestampSampling, tokenByTimestamp.blockchain, tokenByTimestamp.address)
    if (tokens.length > 0) {
      logger.debug('MetaService: end to load token by timestamp')
      logger.debug(tokens[0])
      return tokens[0]
    } else {
      logger.debug('MetaService: token not found')
    }

    logger.debug('MetaService: start to retrieve meta')
    const meta = await this.retrieveMeta()
    logger.debug('MetaService: end to retrieve meta')

    const token = meta.tokens.find(item =>
      item.blockchain.toLocaleLowerCase() === tokenByTimestamp.blockchain.toLocaleLowerCase()
      && (
        (isNullOrEmptyOrWhitespaces(item.address) && isNullOrEmptyOrWhitespaces(tokenByTimestamp.address)) || item.address?.toLocaleLowerCase() === tokenByTimestamp.address?.toLocaleLowerCase()
      )
    )

    // in this case usd price is the current usd price. But if time is in past then we should set it to null
    const timestampNow = Math.floor(Date.now() / 1000)
    if (token && Math.abs(timestampSampling - timestampNow) > META_SAVING_SAMPLING_SECONDS) {
      token.usdPrice = null
    }

    logger.debug('MetaService: token from meta')
    logger.debug(token)

    return token
  }
}
