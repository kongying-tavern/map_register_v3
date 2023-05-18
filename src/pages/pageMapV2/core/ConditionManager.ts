import { IconManager } from './IconManager'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'
import { Logger } from '@/utils'
import { localSettings } from '@/stores'

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

  #getConditionId = () => `${this.areaCode}-${this.itemTypeId}`

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
    this.#putCondition()
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
    return ids
  })

  get existItemIds() { return this.#existItemIds.value }

  /** 条件管理器是否正在进行预渲染 */
  #isPreRendering = ref(false)
  get isPreRendering() { return this.#isPreRendering.value }

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

  #putCondition = async () => {
    try {
      this.#isPreRendering.value = true
      if (!this.areaCode || !this.area || !this.itemType || this.itemTypeId === undefined)
        throw new Error('未选择子地区或物品类型')
      const id = this.#getConditionId()
      if (!this.itemIds.length)
        return this.deleteCondition(id)
      let condition = this.conditions.get(id)
      if (!condition) {
        condition = {
          area: this.area,
          type: this.itemType,
          items: this.itemIds,
        }
      }
      else {
        condition.items = this.itemIds
      }
      this.conditions.set(id, condition)
      await this.requestMarkersUpdate()
    }
    catch (err) {
      (err instanceof Error) && this.#handleError(err)
    }
    finally {
      this.#isPreRendering.value = false
    }
  }

  deleteCondition = async (id: string) => {
    try {
      this.#isPreRendering.value = true
      this.conditions.delete(id)
      this.itemIdsMap[id] = []
      await this.requestMarkersUpdate()
    }
    catch (err) {
      (err instanceof Error) && this.#handleError(err)
    }
    finally {
      this.#isPreRendering.value = false
    }
  }

  reviewCondition = (id: string) => {
    const [areaCode, itemTypeId] = id.split('-')
    this.areaCode = areaCode
    this.itemTypeId = Number(itemTypeId)
    this.tabKey = this.tabNames.length - 1
  }

  clearCondition = async () => {
    if (!this.conditions.size)
      return
    try {
      this.#isPreRendering.value = false
      ;[...this.conditions.keys()].forEach(id => this.itemIdsMap[id] = [])
      this.conditions.clear()
      await this.requestMarkersUpdate()
    }
    catch (err) {
      (err instanceof Error) && this.#handleError(err)
    }
    finally {
      this.#isPreRendering.value = false
    }
  }

  info = (message: string) => {
    logger.info(message)
  }

  #handleError = (err: Error) => {
    logger.error(err)
  }
}
