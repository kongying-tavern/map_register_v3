/**
 * 使用缓存优先策略拦截全局图片类请求
 * @note `onfetch` 回调必须为同步函数
 * @todo 待封装
 */
self.onfetch = (ev) => {
  const { url } = ev.request

  self.clients
    .get(ev.clientId)
    .then((client) => {
      // 首次登录可能还未完成初始化
      client?.postMessage({
        name: 'refreshAuthIfProssible',
      })
    })

  if (!url.match(/^.+\.(png|jpeg|jpg|jxl|jp2|webp|bmp)$/)?.[1]) return

  // TODO 错误处理
  const cacheRequest = async () => {
    const cache = await caches.match(url)
    if (cache) return cache
    const res = await fetch(ev.request)
    const cacheStorage = await caches.open('v1')
    cacheStorage.put(ev.request, res.clone())
    return res
  }

  ev.respondWith(cacheRequest())
}
