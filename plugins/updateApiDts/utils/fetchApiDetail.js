/**
 * 更新
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
