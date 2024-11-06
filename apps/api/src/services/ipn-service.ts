import axios, { AxiosError } from 'axios'

import { IpnDao } from '@repo/dao/dist/src/dao/ipn.dao'
import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { IpnData, IpnKey, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'

import { logger } from '../utils/logger'

export interface IpnService {
  loadIpnData(ipnKey: IpnKey): Promise<IpnData | undefined>
  saveIpnData(ipn: IpnData): Promise<void>
  loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined>
  trySendIpnRequest(url: string, ipn: IpnData, accessToken: string | null): Promise<IpnResult>
}

export class IpnServiceImpl implements IpnService {
  public constructor(
    private ipnDao: IpnDao,
    private paymentDao: PaymentDao
  ) { }

  public async loadIpnData(ipnKey: IpnKey): Promise<IpnData | undefined> {
    logger.debug('IpnService: start to load ipn data for')
    logger.debug(ipnKey)
    const ipn = await this.ipnDao.loadIpnData(ipnKey)
    logger.debug('IpnService: end to load ipn data')
    logger.debug(ipn)

    return ipn
  }

  public async saveIpnData(ipn: IpnData): Promise<void> {
    logger.debug('IpnService: start to save ipn data')
    logger.debug(ipn)
    await this.ipnDao.saveIpnData(ipn)
    logger.debug('IpnService: end to save ipn data')
  }

  public async loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined> {
    logger.debug('IpnService: start to load ipn result for')
    logger.debug(ipnKey)
    const ipnResult = await this.paymentDao.loadIpnResult(ipnKey)
    logger.debug('IpnService: end to load ipn result')
    logger.debug(ipnResult)

    return ipnResult
  }

  public async trySendIpnRequest(url: string, ipn: IpnData, accessToken: string | null): Promise<IpnResult> {
    logger.debug(`IpnService: start to try to send ipn request for url ${url} with access token ${accessToken} and ipn`)
    logger.debug(ipn)

    const config = accessToken
      ? {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
      : {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json',
        }
      }

    const ipnKey: IpnKey = {
      accountId: ipn.accountId,
      paymentId: ipn.paymentId,
      blockchain: ipn.blockchain,
      transaction: ipn.transaction,
      index: ipn.index,
    }

    let ipnResult: IpnResult
    try {
      logger.debug(`IpnService: start to send ipn request`)
      const response = await axios.post(url, ipn, config)
      logger.debug(`IpnService: end to send ipn request`)
      logger.debug(response.data)

      ipnResult = {
        timestamp: Math.floor(Date.now() / 1000),
        status: response.status,
        result: response.data,
        error: null
      }
    } catch (error) {
      logger.error(`IpnService: error sending request to callback url`)
      logger.error(error)

      ipnResult = error instanceof AxiosError
        ? {
          timestamp: Math.floor(Date.now() / 1000),
          status: error.status ?? 500,
          result: null,
          error: error.message
        } : {
          timestamp: Math.floor(Date.now() / 1000),
          status: 500,
          result: null,
          error: 'Internal server error'
        }
    }

    logger.debug(`IpnService: start to save ipn result`)
    logger.debug(ipnKey)
    logger.debug(ipnResult)
    await this.paymentDao.saveIpnResult(ipnKey, ipnResult)
    logger.debug('IpnService: end to save ipn result')

    logger.debug('IpnService: end to try to send ipn request')

    return ipnResult
  }
}
