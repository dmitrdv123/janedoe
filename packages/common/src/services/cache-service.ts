import NodeCache from 'node-cache'

export interface CacheService {
  get<T>(key: string): T | undefined
  set<T>(key: string, data: T, ttl?: number | undefined): boolean
  del(key: string): void
  has(key: string): boolean
  run<T>(cacheKey: string, ttl: number | undefined, func: () => Promise<T>): Promise<T>
}

export class CacheServiceImpl implements CacheService {
  private static cache = new NodeCache()

  public get<T>(key: string): T | undefined {
    return CacheServiceImpl.cache.get<T>(key)
  }

  public set<T>(key: string, data: T, ttl?: number | undefined): boolean {
    return ttl ? CacheServiceImpl.cache.set<T>(key, data, ttl) : CacheServiceImpl.cache.set<T>(key, data)
  }

  public del(key: string): void {
    CacheServiceImpl.cache.del(key)
  }

  public has(key: string): boolean {
    return CacheServiceImpl.cache.has(key)
  }

  public async run<T>(cacheKey: string, ttl: number | undefined, func: () => Promise<T>): Promise<T> {
    const cachedData = CacheServiceImpl.cache.get<T>(cacheKey)

    if (cachedData != undefined) {
      return cachedData
    }

    const data = await func()
    if (ttl) {
      CacheServiceImpl.cache.set(cacheKey, data, ttl)
    } else {
      CacheServiceImpl.cache.set(cacheKey, data)
    }

    return data
  }
}
