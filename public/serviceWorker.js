self.onfetch = (ev) => {
  const { url } = ev.request
  if (!url.match(/^.+\.(png|jpeg|jpg|jxl|jp2|webp|bmp)$/)?.[1]) return

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
