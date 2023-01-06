import type { AnyObject } from '@/shared'

export interface Array2TreeOptions {
  /** 子节点数组的 key 名 */
  childrenKey?: string
  /** 当前节点 id 的 key 名 */
  idKey?: string
  /** 父节点 id 的 key 名 */
  pidKey?: string
  /** 根级节点的 id 号 */
  rootId?: string | number | symbol | bigint
}

export const array2Tree = <T extends AnyObject>(items: T[], options: Array2TreeOptions = {}) => {
  const { childrenKey = 'children', idKey = 'id', pidKey = 'pid', rootId = 0 } = options

  const itemMap: AnyObject = {}

  return items.reduce((result, item) => {
    const id = item[idKey]
    const pid = item[pidKey]

    !itemMap[id] && (itemMap[id] = {
      [childrenKey]: [],
    })
    itemMap[id] = {
      ...item,
      [childrenKey]: itemMap[id][childrenKey],
    }

    const treeItem = itemMap[id]

    if (pid === rootId) {
      result.push(treeItem)
    }
    else {
      !itemMap[pid] && (itemMap[pid] = { [childrenKey]: [] })
      itemMap[pid][childrenKey].push(treeItem)
    }

    return result
  }, [] as (T & { children?: T[] })[])
}
