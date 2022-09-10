/**
 * 更新
 * @param {import('got').Got} got
 * @param {import('../updateApiDts').ApiTree[]} apis
 * @returns {Promise<unknown>}
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
