// @ts-check

/**
 * @typedef {{ version: number; mode: string }} CacheInfoObject
 */
(() => {
  const scope = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis))

  // ==================== global env ====================

  const VERSION = 2
  const CACHEABLE_TYPES = /^.+\.(png|jpeg|jpg|jxl|jp2|webp|bmp|ttf|otf|woff|woff2|eot)$/
  const CACHEABLE_MIME = /(font|image)\//

  // ==================== global utils ====================

  class Logger {
    /**
     * @param {string} type
     * @param {string[]} args
     */
    static output = async (type, args) => {
      globalThis.clients
        .matchAll({ includeUncontrolled: true })
        .then((clients) => {
          clients.forEach(client => client.postMessage({
            action: 'log',
            value: { type, args },
          }))
        })
    }

    /** @param {string[]} args */
    static info = (...args) => this.output('info', args)

    /** @param {string[]} args */
    static error = (...args) => this.output('error', args)
  }

  class CacheInfo {
    /**
     * @param {string} cacheName
     * @returns {CacheInfoObject} 解析后的缓存库附加信息
     */
    static parse = (cacheName) => {
      const cacheInfoTuple = cacheName.match(/(?<=(->\[))[\s\S]+(?=(\]))/)?.[0]?.split(',')
      if (!cacheInfoTuple) {
        return {
          version: 0,
          mode: 'no-cors',
        }
      }
      const [strVersion, mode] = cacheInfoTuple
      return {
        version: Number(strVersion),
        mode,
      }
    }

    /**
     * @param {CacheInfoObject} info
     * @returns {`->[${string}]`} string cache info
     */
    static stringify = (info) => {
      const { version, mode } = info
      return `->[${version},${mode}]`
    }
  }

  // ====================   on install   ====================

  scope.addEventListener('install', (ev) => {
    Logger.info('install')
    ev.waitUntil(scope.skipWaiting())
  })

  // ====================    on active    ====================

  /**
   * 检查过期缓存
   * - 缓存附加信息的表示格式示例: `tiles-twt40->[v1,cors]`
   */
  const clearOutDatedCache = async () => {
    const allCacheNames = await caches.keys()
    await Promise.all(allCacheNames.map((cacheName) => {
      const { version } = CacheInfo.parse(cacheName)
      const isOutDated = Number.isNaN(version) || version < VERSION
      return isOutDated ? scope.caches.delete(cacheName) : false
    }))
    scope.registration.active?.postMessage('')
  }

  scope.addEventListener('activate', (ev) => {
    Logger.info('activate')
    // clear old cache
    ev.waitUntil((async () => {
      await clearOutDatedCache()
      await scope.clients.claim()
    })())
  })

  // ====================    on fetch    ====================

  /** @param {string} pathname */
  const matchExtension = (pathname) => {
    return pathname.match(CACHEABLE_TYPES)?.[1]
  }

  /**
   * @param {string} pathname
   * @param {string} extension
   */
  const matchCacheName = (pathname, extension) => {
    // 1. 地图切片
    const tilesCode = pathname.match(/tiles_([a-zA-Z0-9]+)\//)?.[1]
    if (tilesCode)
      return `tiles-${tilesCode}`

    // 2. 地下/附加图层
    if (pathname.includes('/d/underground/'))
      return 'overlays'

    // 3. 字体
    if (['ttf', 'woff', 'woff2', 'eot'].find(name => name === extension))
      return `fonts`

    // 4. 图标
    if (pathname.includes('/icons/'))
      return 'icons'

    return ''
  }

  scope.addEventListener('fetch', (ev) => {
    const { url, mode } = ev.request.clone()
    const { pathname } = new URL(url)

    const extension = matchExtension(pathname)
    if (!extension)
      return

    const cacheName = matchCacheName(pathname, extension)
    if (!cacheName)
      return

    ev.respondWith((async () => {
      try {
        const strCacheInfo = CacheInfo.stringify({
          version: VERSION,
          mode,
        })
        const storageName = `${cacheName}${strCacheInfo}`
        const storage = await scope.caches.open(storageName)

        const maybeCachedResponse = await storage.match(url)
        if (maybeCachedResponse)
          return maybeCachedResponse

        const res = await fetch(ev.request)
        const clonedRes = res.clone()

        if ([
          clonedRes.status === 200,
          clonedRes.headers.get('content-type')?.match(CACHEABLE_MIME),
        ].every(Boolean)) {
          Logger.info(`storage "${storageName}" cache`, clonedRes.url)
          await storage.put(url, clonedRes)
        }

        return res
      }
      catch (err) {
        Logger.error(err instanceof Error ? err.message : `${err}`)
        return new Response(null, {
          status: 404,
          statusText: err instanceof Error ? err.message : 'Request Error',
        })
      }
    })())
  })
})()
