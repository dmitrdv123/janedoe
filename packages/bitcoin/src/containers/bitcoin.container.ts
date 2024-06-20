import * as bitcoin from 'bitcoinjs-lib'

import appConfig from '@repo/common/dist/src/app-config'

import { Container } from '@repo/common/dist/src/containers/container'
import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { daoContainer } from '@repo/dao-aws/dist/src/containers/dao.container'

import { BitcoinBlockServiceImpl } from '../services/bitcoin-block.service'
import { BitcoinCoreService, BitcoinCoreServiceImpl } from '../services/bitcoin-core.service'
import { BitcoinUtilsService, BitcoinUtilsServiceImpl } from '../services/bitcoin-utils.service'
import { BitcoinServiceImpl } from '../services/bitcoin.service'

export const bitcoinContainer = new Container()

// Services
bitcoinContainer.register(
  'bitcoinUtilsService',
  new BitcoinUtilsServiceImpl(
    appConfig.IS_DEV ? bitcoin.networks.regtest : bitcoin.networks.bitcoin
  )
)
bitcoinContainer.register('bitcoinCoreService', new BitcoinCoreServiceImpl())
bitcoinContainer.register(
  'bitcoinBlockService',
  new BitcoinBlockServiceImpl(
    bitcoinContainer.resolve<BitcoinCoreService>('bitcoinCoreService'),
    daoContainer.resolve<BitcoinDao>('bitcoinDao'),
  )
)
bitcoinContainer.register(
  'bitcoinService',
  new BitcoinServiceImpl(
    bitcoinContainer.resolve<BitcoinCoreService>('bitcoinCoreService'),
    bitcoinContainer.resolve<BitcoinUtilsService>('bitcoinUtilsService'),
    daoContainer.resolve<BitcoinDao>('bitcoinDao'),
  )
)
