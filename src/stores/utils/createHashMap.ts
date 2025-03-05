import type { Hash } from 'types/database'

export const createHashMap = <T>(dbList: Hash<T>[]) => {
  return dbList.reduce((map, info) => {
    const { __hash: hash = '' } = info
    if (!map.has(hash))
      map.set(hash, [])
    map.get(hash)!.push(info)
    return map
  }, new Map<string, Hash<T>[]>())
}
