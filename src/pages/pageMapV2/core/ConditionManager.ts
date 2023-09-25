import { ElMessage } from 'element-plus'
import { IconManager } from './IconManager'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'
import { ICON } from '@/pages/pageMapV2/config'
import { localSettings, useMapStore, useTileStore, useUserStore } from '@/stores'

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

export interface MarkerWithRenderConfig extends API.MarkerVo {
  render: {
    itemId: number
  }
}

export class ConditionManager extends IconManager {
  // ========== 对外绑定的数据 ==========

  get tabNames() { return ['地区', '分类', '物品'] }

  #tabKey = ref(0)
  get tabKey() { return this.#tabKey.value }
  set tabKey(v) { this.#tabKey.value = v }

  next = () => {
    if (!localSettings.value.autoTurnNext || this.#tabKey.value >= this.tabNames.length)
      return
    this.#tabKey.value += 1
  }

  #parentAreaCode = ref<string>()
  get parentAreaCode() { return this.#parentAreaCode.value }
  set parentAreaCode(v) { this.#parentAreaCode.value = v }

  /** 物品筛选绑定的地区数据 */
  #areaCode = ref<string>()
  get areaCode() { return this.#areaCode.value }
  set areaCode(code) {
    if (code === this.areaCode)
      return
    try {
      useMap().map.value?.setBaseLayerByAreaCode(code)
      this.#areaCode.value = code
      this.itemTypeId = undefined
      this.saveState('temp')
    }
    catch (err) {
      this.#handleError(err as Error)
    }
  }

  #selectArea = async (areaCode: string) => {
    this.areaCode = areaCode
    const { parentId } = (await db.area.where('code').equals(areaCode).first()) ?? {}
    if (parentId !== undefined)
      this.parentAreaCode = (await db.area.get(parentId))?.code ?? ''
  }

  /** 物品筛选绑定的物品类型数据 */
  #itemTypeId = ref<number>()
  get itemTypeId() { return this.#itemTypeId.value }
  set itemTypeId(v) {
    if (v === this.itemTypeId)
      return
    this.#itemTypeId.value = v
  }

  #getConditionId = (areaCode = this.areaCode, itemTypeId = this.itemTypeId) => {
    return `${areaCode}-${itemTypeId}`
  }

  /** 物品筛选器缓存的物品选择表，key 为 `${areaCode}-${itemTypeId}` */
  #itemIdsMap = ref<Record<string, number[]>>({})
  get itemIdsMap() { return this.#itemIdsMap.value }

  /** 物品筛选绑定的物品数据 */
  get itemIds() {
    if (!this.areaCode || this.itemTypeId === undefined)
      return []
    const id = this.#getConditionId()
    if (!this.itemIdsMap[id])
      this.itemIdsMap[id] = []
    return this.itemIdsMap[id]
  }

  set itemIds(v) {
    if (!this.areaCode || this.itemTypeId === undefined)
      return
    const id = this.#getConditionId()
    this.itemIdsMap[id] = v
    this.#putCondition(undefined, undefined, v)
  }

  // ========== 内部状态 ==========

  get area() { return this.#area.value }
  #area = asyncComputed(() => {
    return this.areaCode === undefined
      ? undefined
      : db.area.where('code').equals(this.areaCode).first()
  })

  get itemType() { return this.#itemType.value }
  #itemType = asyncComputed(() => {
    return this.itemTypeId === undefined
      ? undefined
      : db.itemType.where('id').equals(this.itemTypeId).first()
  })

  /** 图层与点位映射表 */
  #layerMarkerMap = ref<Record<string, MarkerWithRenderConfig[]>>({})
  get layerMarkerMap() { return this.#layerMarkerMap.value }

  /** 条件列表 */
  #conditions = ref<Map<string, Condition>>(new Map())
  get conditions() { return this.#conditions.value }

  /** 已存在的物品 ids */
  #existItemIds = computed(() => {
    let ids: number[] = []
    this.conditions.forEach(({ items }) => {
      ids = ids.concat(items)
    })
    return [...new Set(ids)]
  })

  get existItemIds() { return this.#existItemIds.value }

  #useRenderMission = async (fn: (requestRender: () => Promise<void>) => Promise<void> | void) => {
    try {
      await fn(this.requestMarkersUpdate)
    }
    catch (err) {
      (err instanceof Error) && this.#handleError(err)
    }
  }

  /** 仅在改变条件时改变，以便各图层进行脏检查 */
  #conditionStateId = ref(crypto.randomUUID())

  get conditionStateId() { return this.#conditionStateId.value }
  set conditionStateId(v) {
    this.#conditionStateId.value = v
  }

  #findValidItemId = (items: API.MarkerItemLinkVo[] = []) => {
    for (const { itemId = -1 } of items) {
      if (ICON.positions.findIndex(({ position }) => this.iconMapping[`${itemId}_${position}_default`] !== undefined) > -1)
        return itemId
    }
    return -1
  }

  #attachRenderConfig = (marker: API.MarkerVo): MarkerWithRenderConfig => ({
    ...marker,
    render: {
      itemId: this.#findValidItemId(marker.itemList),
    },
  })

  #markers = shallowRef<API.MarkerVo[]>([])
  get markers() { return this.#markers.value }

  #initLayerMarkerMap = async () => {
    const { mergedTileConfigs } = useTileStore()
    const { currentLayerCode } = useMapStore()

    const itemIdsGroup: number[][] = []
    this.conditions.forEach((condition) => {
      const { tile } = mergedTileConfigs[condition.area.code!] ?? {}
      if (tile.code !== currentLayerCode)
        return
      itemIdsGroup.push(condition.items)
    })

    const markers = (await db.marker.where('itemIdList').anyOf(itemIdsGroup.flat(1)).toArray())
      .map(this.#attachRenderConfig)

    this.#markers.value = markers

    this.#conditionStateId.value = crypto.randomUUID()
  }

  /** 对点位图层进行重绘 */
  requestMarkersUpdate = async () => {
    const currentLayer = useMap().map.value?.baseLayer
    if (!currentLayer)
      return
    const items = (await db.item.bulkGet(this.existItemIds)).filter(Boolean) as API.ItemVo[]
    await this.initIconMap(items)
    await this.#initLayerMarkerMap()
    currentLayer.forceUpdate()
  }

  #putCondition = (
    area = this.area,
    itemType = this.itemType,
    itemIds = this.itemIds,
    render = true,
  ) => this.#useRenderMission(async (requestRender) => {
    if (!area || !itemType)
      throw new Error('未选择子地区或物品类型')

    const id = this.#getConditionId(area.code as string, itemType.id as number)

    if (!itemIds.length) {
      await this.deleteCondition(id, true)
      render && await requestRender()
      return
    }

    const condition = this.conditions.get(id)
    if (!condition) {
      const newCondition = { area, type: itemType, items: itemIds }
      this.conditions.set(id, newCondition)
    }
    else {
      condition.items = itemIds
    }

    if (render) {
      await this.saveState('temp')
      await requestRender()
    }
  })

  deleteCondition = (id: string, render = true) => this.#useRenderMission(async (requestRender) => {
    this.conditions.delete(id)
    this.itemIdsMap[id] = []
    if (render) {
      await this.saveState('temp')
      await requestRender()
    }
  })

  reviewCondition = async (id: string) => {
    const [areaCode, itemTypeId] = id.split('-')
    this.areaCode = areaCode
    await this.#selectArea(areaCode)
    this.itemTypeId = Number(itemTypeId)
    this.tabKey = this.tabNames.length - 1
  }

  clearCondition = (render = true) => this.#useRenderMission(async (requestRender) => {
    if (!this.conditions.size)
      return
    ;[...this.conditions.keys()].forEach(id => this.itemIdsMap[id] = [])
    this.conditions.clear()
    if (render) {
      await this.saveState('temp')
      await requestRender()
    }
  })

  /** 将筛选器状态保存到本地数据库 */
  saveState = async (name: string) => {
    const userStore = useUserStore()
    if (!userStore.info.id)
      return

    const conditions = Object.fromEntries(this.conditions.entries())
    const filterState = {
      name,
      conditions,
    }
    const filterStates = [...(userStore.preference.filterStates ?? [])]
    const findIndex = filterStates.findIndex(state => state.name === name)

    if (findIndex >= 0)
      filterStates[findIndex] = filterState
    else
      filterStates.push(filterState)

    userStore.preference = {
      ...userStore.preference,
      filterStates,
      areaCode: this.areaCode,
    }
    await userStore.syncUserPreference()
  }

  deleteState = async (name: string) => {
    const userStore = useUserStore()
    if (!userStore.info.id)
      return
    if (name === 'temp')
      return
    const filterStates = [...(userStore.preference.filterStates ?? [])]
    const findIndex = filterStates.findIndex(state => state.name === name)
    if (findIndex < 0)
      return
    filterStates.splice(findIndex, 1)
    userStore.preference = {
      ...userStore.preference,
      filterStates,
    }
    await userStore.syncUserPreference()
  }

  /**
   * 从本地数据库读取筛选器状态。
   * 'temp' 条件为内部条件，
   * 每个条件改变的操作都会被及时同步到 temp 条件，
   * 以便在重新进入应用时获取上次操作后的条件列表。
   */
  loadState = (name: string) => this.#useRenderMission(async (requestRender) => {
    const userStore = useUserStore()
    if (userStore.info.id === undefined)
      return

    const findState = userStore.preference.filterStates?.find(state => state.name === name)
    if (!findState?.conditions)
      return

    await this.clearCondition(false)
    this.#conditions.value = new Map(Object.entries(findState.conditions))

    const itemIdsMap: Record<string, number[]> = {}
    this.conditions.forEach(({ items }, key) => itemIdsMap[key] = items)
    this.#itemIdsMap.value = itemIdsMap

    const { areaCode } = userStore.preference
    areaCode && await this.#selectArea(areaCode)

    await this.saveState('temp')
    await requestRender()
  })

  #handleError = (err: Error) => {
    ElMessage.error({
      message: err.message,
      offset: 48,
    })
  }
}
