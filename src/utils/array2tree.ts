export interface Array2TreeOptions<C, I, P, R> {
  /** 子节点数组的 key 名 */
  childrenKey: C
  /** 当前节点 id 的 key 名 */
  idKey: I
  /** 父节点 id 的 key 名 */
  pidKey: P
  /** 根级节点的 id 号 */
  rootId: R
}

type AddChildrenKeyToObject<T, K extends string> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : AddChildrenKeyToObject<T, K>[];
}

/**
 * 将数组转换为具有上下级关系的树形结构
 * 每个对象必须包含能判断父子级关系的字段
 */
export const array2Tree = <T extends object, C extends string, I extends keyof T, P extends keyof T, R extends T[I]>(
  items: T[],
  options: Array2TreeOptions<C, I, P, R>,
) => {
  const {
    childrenKey,
    idKey,
    pidKey,
    rootId,
  } = options

  const itemMap = items.reduce((map, item) => {
    return map.set(item[idKey], {
      ...item,
      [childrenKey]: [],
    } as AddChildrenKeyToObject<T, C>)
  }, new Map<T[I] | T[P], AddChildrenKeyToObject<T, C>>())

  const result = items.reduce((treeData, item) => {
    const id = item[idKey]
    const pid = item[pidKey]

    const indexItem = itemMap.get(id)!

    itemMap.set(id, {
      ...indexItem,
      [childrenKey]: indexItem[childrenKey],
    })

    if (pid === rootId) {
      treeData.push(indexItem)
    }
    else {
      const children = itemMap.get(pid)![childrenKey]
      ;(children as AddChildrenKeyToObject<T, C>[]).push(indexItem)
    }

    return treeData
  }, [] as AddChildrenKeyToObject<T, C>[])

  return result
}
