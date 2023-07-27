/** 从订阅源获取打点的相关依赖配置 */
const getDadianConfig = async () => {
  const res = await fetch('https://assets.yuanshen.site/dadian.json')
  return await res.json() as API.DadianJSON
}

export default {
  getDadianConfig,
}
