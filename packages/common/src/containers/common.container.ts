import { CacheServiceImpl } from '../services/cache-service'
import { RangoWrapperServiceImpl } from '../services/rango-wrapper-service'
import { Container } from './container'

export const commonContainer = new Container()

// Services
commonContainer.register('cacheService', new CacheServiceImpl())
commonContainer.register('rangoWrapperService', new RangoWrapperServiceImpl())
