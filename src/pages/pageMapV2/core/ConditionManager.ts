import { IconManager } from './IconManager'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'
import { Logger } from '@/utils'
import { localSettings, useAreaStore, useItemTypeStore, useUserStore } from '@/stores'

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

const logger = new Logger('[条件管理器]')

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
  set areaCode(v) {
    if (v === this.areaCode)
      return
    // 切换子区域时，同时切换对应的底图
    const findLayer = LAYER_CONFIGS.find(({ areaCodes = [] }) => areaCodes.find(code => code === v) !== undefined)
    if (!findLayer)
      throw new Error(`无法找到对应的底图设置 (areaCode: ${v})`)
    useMap().map.value?.setBaseLayer(findLayer.code)
    this.#areaCode.value = v
    this.itemTypeId = undefined
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
  #layerMarkerMap = ref<Record<string, API.MarkerVo[]>>({})
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

  /** 条件管理器是否正在进行预渲染 */
  #isPreRendering = ref(false)
  get isPreRendering() { return this.#isPreRendering.value }

  #useRenderMission = async (fn: (requestRender: () => Promise<void>) => Promise<void> | void) => {
    if (this.isPreRendering)
      return
    try {
      await fn(this.requestMarkersUpdate)
    }
    catch (err) {
      (err instanceof Error) && this.#handleError(err)
    }
    finally {
      this.#isPreRendering.value = false
    }
  }

  /** 仅在改变条件时改变，以便各图层进行脏检查 */
  #conditionStateId = ref(crypto.randomUUID())
  get conditionStateId() { return this.#conditionStateId.value }

  #initLayerMarkerMap = () => Promise.all(LAYER_CONFIGS.map(async ({ code, areaCodes = [] }) => {
    // 筛选出只存在于当前图层的点位
    let itemIdsInThisLayer: number[] = []
    this.conditions.forEach((condition) => {
      if (!areaCodes.includes(condition.area.code as string))
        return
      itemIdsInThisLayer = itemIdsInThisLayer.concat(condition.items)
    })
    const markers = (await db.marker.where('itemIdList').anyOf(itemIdsInThisLayer).toArray()).map(marker => ({
      ...marker,
    }))
    this.#layerMarkerMap.value[code] = markers
  }))

  requestMarkersUpdate = async () => {
    const layer = useMap().map.value?.baseLayer
    if (!layer)
      return
    this.#conditionStateId.value = crypto.randomUUID()
    await this.#initLayerMarkerMap()
    const items = (await db.item.bulkGet(this.existItemIds)).filter(Boolean) as API.ItemVo[]
    await this.initIconMap(items)
    layer.forceUpdate()
  }

  #putCondition = (
    area = this.area,
    type = this.itemType,
    items = this.itemIds,
    render = true,
  ) => this.#useRenderMission(async (requestRender) => {
    if (!area || !type)
      throw new Error('未选择子地区或物品类型')

    const id = this.#getConditionId(area.code as string, type.id as number)

    if (!items.length) {
      await this.deleteCondition(id, true)
      render && await requestRender()
      return
    }

    const condition = this.conditions.get(id)
    if (!condition) {
      const newCondition = { area, type, items }
      this.conditions.set(id, newCondition)
    }
    else {
      condition.items = items
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
    const { parentId } = (await db.area.where('code').equals(areaCode).first()) ?? {}
    if (parentId !== undefined)
      this.parentAreaCode = (await db.area.get(parentId))?.code ?? ''
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

  /** 将物品 ids 转换为条件表 */
  #classifyItems = async (itemIds: number[]): Promise<Map<string, Condition>> => {
    const conditions = new Map<string, Condition>()

    const { itemTypeMap } = useItemTypeStore()
    const { areaMap } = useAreaStore()
    const items = await db.item.bulkGet(itemIds)

    items.forEach((item) => {
      if (!item)
        return
      const itemArea = areaMap[item.areaId as number]
      if (!itemArea)
        return
      item.typeIdList?.forEach((itemTypeId) => {
        const itemType = itemTypeMap[itemTypeId]
        if (!itemType)
          return
        const id = this.#getConditionId(itemArea.code as string, itemType.id as number)
        const condition = conditions.get(id) ?? {
          area: itemArea,
          type: itemType,
          items: [],
        }
        condition.items.push(item.id as number)
        conditions.set(id, condition)
      })
    })

    return conditions
  }

  /** 将筛选器状态保存到本地数据库 */
  saveState = async (name: string) => {
    const userStore = useUserStore()
    if (!userStore.info.id)
      return

    const filterState = {
      name,
      itemIds: this.existItemIds,
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
  loadState = async (name: string) => this.#useRenderMission(async (requestRender) => {
    const userStore = useUserStore()

    if (userStore.info.id === undefined)
      return

    const findState = userStore.preference.filterStates?.find(state => state.name === name)
    if (!findState)
      throw new Error('无法查找打到对应的筛选器状态')

    await this.clearCondition(false)
    const conditions = await this.#classifyItems(findState.itemIds)

    this.#conditions.value = conditions

    const itemIdsMap: Record<string, number[]> = {}
    conditions.forEach(({ items }, key) => {
      itemIdsMap[key] = items
    })
    this.#itemIdsMap.value = itemIdsMap

    await this.saveState('temp')
    await requestRender()
  })

  #handleError = (err: Error) => {
    logger.error(err)
  }
}
