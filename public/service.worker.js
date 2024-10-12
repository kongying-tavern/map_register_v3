// @ts-check

/**
 * @typedef {{ version: number; mode: string }} CacheInfoObject
 */
void (() => {
  const scope = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis))

  // ==================== global env ====================

  const VERSION = 2
  const AVAILABLE_DESTINATION = new Set(['audio', 'font', 'image', 'video'])
  const IMAGE_TYPES = new Set(['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'])

  // ==================== global utils ====================

  class Logger {
    /**
     * @param {string} type
     * @param {string[]} args
     */
    static output = async (type, args) => {
      scope.clients
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

  /**
   * @param {string} pathname
   * @param {string} destination
   */
  const matchCacheName = (pathname, destination) => {
    // 1. 地图切片
    const tilesCode = pathname.match(/tiles_([a-zA-Z0-9]+)\//)?.[1]
    if (tilesCode)
      return `tiles-${tilesCode}`

    // 2. 附加图层
    if (pathname.includes('/d/underground/'))
      return 'overlays'

    // 3. 字体
    if (destination === 'font')
      return 'fonts'

    // 4. 图标
    if (pathname.includes('/icons/'))
      return 'icons'

    return ''
  }

  scope.addEventListener('fetch', (ev) => {
    const { url, mode, destination: rawDestination } = ev.request.clone()
    const { protocol, hostname, pathname } = new URL(url)

    // 由元素发起的请求会获取此值，但 fetch 发起的请求就没有了，需要通过技术手段确定
    const destination = rawDestination || (() => {
      const extname = (url.match(/(\.[a-zA-Z0-9]+)$/)?.[1] ?? '.unknown').replace('.', '').toLowerCase()
      if (IMAGE_TYPES.has(extname))
        return 'image'
      return ''
    })()

    if ([
      !protocol.startsWith('http'),
      hostname === 'localhost',
      hostname === '127.0.0.1',
      !AVAILABLE_DESTINATION.has(destination),
    ].some(Boolean))
      return

    const cacheName = matchCacheName(pathname, destination)
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

        if (clonedRes.status === 200) {
          Logger.info(`storage "${storageName}" cache`, url)
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
