import type { ProxyOptions } from 'vite'

/**
 * 创建米忽悠官网静态资源地址代理，当应用由 vite 代理运行时，可以跨域访问米忽悠的部分官方资源
 * @note 内部访问时使用 `/mhy-${field}` 重写地址
 * @example
 * 资源地址 `https://ys.mihoyo.com/example/01.jpg`
 * 请求地址 `/mhy-ys/example/01.jpg`
 */
export const createMHYProxy = (target: string): [string, ProxyOptions] => {
  const field = target.match(/(?<=(https:\/\/))(.+)?(?=(\.mihoyo\.com))/)?.[0]
  if (!field) throw new Error(`无法匹配域: ${target}`)

  const proxyPrefix = `/mhy-${field}`

  const proxyOptions: ProxyOptions = {
    target,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${proxyPrefix}`), ''),
  }

  return [proxyPrefix, proxyOptions]
}

export const getMHYProxys = () => {
  return Object.fromEntries([
    'https://content-static.mihoyo.com',
    'https://webstatic.mihoyo.com',
    'https://uploadstatic.mihoyo.com',
    'https://ys.mihoyo.com',
  ].map(createMHYProxy))
}
