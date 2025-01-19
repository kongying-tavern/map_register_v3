/** 从订阅源获取打点的相关依赖配置 */
const getDadianConfig = async (options: {
  timeout?: number
} = {}) => {
  const {
    timeout = 10000,
  } = options
  const abortController = new AbortController()
  setTimeout(() => {
    abortController.abort()
  }, timeout)
  const res = await fetch(`${import.meta.env.VITE_CONFIG_ARCHIVE}`, {
    signal: abortController.signal,
  })
  return await res.arrayBuffer()
}

export default {
  getDadianConfig,
}
