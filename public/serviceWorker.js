const VERSION = 2
let isDev = false

const logger = new class {
  constructor(prefix = '') {
    this.prefix = prefix
  }
  log = (...args) => isDev && console.log(this.prefix, ...args)
  error = (...args) => isDev && console.log(this.prefix, ...args)
}('[ServiceWorker]')

/**
 * 公共消息传递
 * @param {string} message 
 * @param {Transferable[]} transfer 
 */
const sendPublicMessage = async (message = '', transfer = []) => {
  const clients = await self.clients.matchAll()
  await Promise.all(clients.map(client => client.postMessage(message, transfer)))
}

/**
 * @param {MessageEvent<string>} ev 
 */
self.onmessage = (ev) => {
  const payload = JSON.parse(ev.data)
  const { action, type, value } = payload
  if (action === 'setEnvValue') {
    isDev = value
  }

  sendPublicMessage(JSON.stringify({
    action: 'roger',
    type: 'string',
    value: action,
  }))
}

/** 清空缓存 */
const clearCaches = async () => {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map((cacheName) => {
    const version = Number(cacheName.match(/(?<=[\w\W]+-V)\d+$/)?.[0])
    if (!isNaN(version) && version < VERSION)
      return caches.delete(cacheName)
  }))
}

/** 强制等待 SW 激活 */
self.oninstall = (ev) => {
  ev.waitUntil(async () => {
    await self.skipWaiting()
    await getEnvValue()

    // 新版本安装后删除低于当前版本的旧缓存
    await clearCaches()
  })
}

/** 设置为主域下的 controller */
self.onactivate = (ev) => {
  ev.waitUntil(clients.claim())
}

/**
 * 使用缓存优先策略拦截全局图片类请求
 * @note 放置在 public 以便监听以 / 为基础路径发出的全部请求
 * @note `onfetch` 回调必须为同步函数
 * @todo 待封装
 */
self.onfetch = (ev) => {
  const { url } = ev.request

  const urlObj = new URL(url)

  // 只拦截图片类型请求
  if (urlObj.pathname.match(/^.+\.(png|jpeg|jpg|jxl|jp2|webp|bmp)$/)?.['index'] !== 0)
    return

  // 只缓存底图切片和物品图标
  let cacheStorageName = ''

  // 1. 底图切片
  const tilesMatcheResult = urlObj.pathname.match(/tiles_([a-zA-Z0-9]+)\//)
  if (tilesMatcheResult) {
    const code = tilesMatcheResult[1]
    code && (cacheStorageName = `map-tiles-${code}-V${VERSION}`)
  }

  // 2. 物品图标
  else if (urlObj.pathname.match(/icons/)) {
    cacheStorageName = `item-icons-V${VERSION}`
  }

  if (!cacheStorageName)
    return

  const cacheRequest = async () => {
    try {
      // 如果匹配到缓存则直接返回
      const cachedResult = await caches.match(url)
      if (cachedResult)
        return cachedResult
  
      // 如果匹配不到则拦截请求
      // 因为绘图器可能需要将图片绘制到 webgl 上，图片必须是跨域的，这里需要覆盖使用跨域请求
      const res = await fetch(url, {
        mode: 'cors',
        referrerPolicy: 'no-referrer',
      })

      if (res.status !== 200)
        throw res

      const cachedRes = res.clone()
      const cacheStorage = await caches.open(cacheStorageName)
      await cacheStorage.put(url, cachedRes)
      return res
    }
    catch (err) {
      logger.error(err)
      return err instanceof Response ? err : new Response(null, {
        status: 404,
        statusText: 'Not Found or CORS Failed',
      })
    }
  }

  ev.respondWith(cacheRequest())
}
