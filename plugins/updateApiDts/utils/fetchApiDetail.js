/**
 * 根据接口列表并发请求其详细定义
 * ### 需要注意的事:
 * 1. 不保证可用性，可能会被 apifox 封号
 * @param {import('got').Got} got
 * @param {import('../types').ApiTree[]} apis
 * @returns {Promise<import('../types').ApiDetail[]>}
 */
const fetchApiDetail = async (got, apis) => {
  const mission = apis.map(async (api) => {
    const id = api.api?.id
    if (!id) return
    const { data } = await got.get(`${id}`).json()
    return data
  })
  return await Promise.all(mission)
}

module.exports = fetchApiDetail
