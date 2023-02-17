/** 强制等待 SW 激活 */
self.oninstall = () => {
  self.skipWaiting()
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

  // 只拦截图片类型请求
  if (url.match(/^.+\.(png|jpeg|jpg|jxl|jp2|webp|bmp)$/)?.['index'] !== 0)
    return

  // 只缓存以下几种情况
  let cacheStorageName = undefined

  // 1. 地图图片
  if (url.match(/http(s?):\/\/assets.yuanshen.site\/tiles_/)?.['index'] === 0)
    cacheStorageName = 'map-tiles'

  // 2. 物品图标
  else if (url.match(/http(s?):\/\/assets.yuanshen.site\/icons/)?.['index'] === 0)
    cacheStorageName = 'item-icons'

  // 3. 其他图片
  else
    cacheStorageName = 'other-image'
  
  const cacheRequest = async () => {
    try {
      // 如果匹配到缓存则直接返回
      const cachedResult = await caches.match(ev.request)
      if (cachedResult) {
        ev.respondWith(cachedResult)
        return
      }
  
      // 如果匹配不到则拦截请求
      const res = await fetch(ev.request)
      ;(await caches.open(cacheStorageName)).put(ev.request, res.clone())
      ev.respondWith(res)
    }
    catch (err) {
      console.log(`[Service Worker] 缓存失败，已返回原始响应对象。${err.message}`)
    }
  }

  ev.waitUntil(cacheRequest)
}
