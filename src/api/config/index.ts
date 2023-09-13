/** 从订阅源获取打点的相关依赖配置 */
const getDadianConfig = async () => {
  const res = await fetch(`${import.meta.env.VITE_ASSETS_BASE}/dadian.json.bz2`)
  return await res.arrayBuffer()
}

export default {
  getDadianConfig,
}
