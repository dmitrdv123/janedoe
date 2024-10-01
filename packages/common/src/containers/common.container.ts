import { CacheServiceImpl } from '../services/cache-service'
import { CryptoServiceImpl } from '../services/crypto-service'
import { RangoWrapperServiceImpl } from '../services/rango-wrapper-service'
import { Container } from './container'

export const commonContainer = new Container()

// Services
commonContainer.register('cacheService', new CacheServiceImpl())
commonContainer.register('rangoWrapperService', new RangoWrapperServiceImpl())
commonContainer.register('cryptoService', new CryptoServiceImpl())
