/**
 * 为点位选择主要渲染图标
 * @todo 可能需要根据设置来选择策略
 */
export const pickMainItem = ({ itemList = [] }: API.MarkerVo, itemIdMap: Map<number, API.ItemVo>) => {
  const restItemIds: number[] = []
  const restIconTags: string[] = []

  let index = -1
  let mainItem: API.ItemVo | undefined

  itemList.forEach(({ itemId = -1 }) => {
    const item = itemIdMap.get(itemId)
    if (!item)
      return

    if (!mainItem) {
      mainItem = item
      index = item.sortIndex ?? -1
      return
    }

    // 将 sortIndex 更大的作为主渲染图标
    const { sortIndex = -1 } = item
    if (sortIndex <= index)
      return

    mainItem = item
    index = sortIndex
  })

  return {
    mainItemId: mainItem!.id!,
    restItemIds,
    mainIconTag: mainItem!.iconTag!,
    restIconTags,
  }
}
