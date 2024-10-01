import { Container } from '@repo/common/dist/src/containers/container'
import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { CryptoService } from '@repo/common/dist/src/services/crypto-service'

import { daoContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'

import { BitcoinBlockServiceImpl } from '../services/bitcoin-block.service'
import { BitcoinCoreService, BitcoinCoreServiceImpl } from '../services/bitcoin-core.service'
import { BitcoinUtilsService, BitcoinUtilsServiceImpl } from '../services/bitcoin-utils.service'
import { BitcoinServiceImpl } from '../services/bitcoin.service'
import { getBitcoinNetwork } from '../utils/bitcoin-utils'

export const bitcoinContainer = new Container()

// Services
bitcoinContainer.register(
  'bitcoinUtilsService',
  new BitcoinUtilsServiceImpl(
    getBitcoinNetwork()
  )
)
bitcoinContainer.register('bitcoinCoreService', new BitcoinCoreServiceImpl())
bitcoinContainer.register(
  'bitcoinBlockService',
  new BitcoinBlockServiceImpl(
    bitcoinContainer.resolve<BitcoinCoreService>('bitcoinCoreService'),
    commonContainer.resolve<CacheService>('cacheService'),
    commonContainer.resolve<CryptoService>('cryptoService'),
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
