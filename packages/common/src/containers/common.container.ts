import { BitcoinServiceImpl } from '../services/bitcoin-service'
import { BitcoinWrapperService, BitcoinWrapperServiceImpl } from '../services/bitcoin-wrapper-service'
import { CacheService, CacheServiceImpl } from '../services/cache-service'
import { RangoWrapperServiceImpl } from '../services/rango-wrapper-service'
import { Container } from './container'

export const commonContainer = new Container()

// Services
commonContainer.register('cacheService', new CacheServiceImpl())
commonContainer.register(
  'bitcoinWrapperService',
  new BitcoinWrapperServiceImpl(
    commonContainer.resolve<CacheService>('cacheService')
  )
)
commonContainer.register(
  'bitcoinService',
  new BitcoinServiceImpl(
    commonContainer.resolve<BitcoinWrapperService>('bitcoinWrapperService')
  )
)
commonContainer.register('rangoWrapperService', new RangoWrapperServiceImpl())
