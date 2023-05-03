import { IconManager } from './IconManager'
import type { MarkerWithExtra } from '.'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'
import { ExtraJSON, Logger } from '@/utils'

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

const logger = new Logger('[条件管理器]')

export class ConditionManager extends IconManager {
  // ========== 对外绑定的数据 ==========
  #parentAreaCode = ref<string>()
  get parentAreaCode() { return this.#parentAreaCode.value }
  set parentAreaCode(v) { this.#parentAreaCode.value = v }

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

  #itemTypeId = ref<number>()
  get itemTypeId() { return this.#itemTypeId.value }
  set itemTypeId(v) {
    if (v === this.itemTypeId)
      return
    this.#itemTypeId.value = v
    this.itemIds = []
  }

  #itemIds = ref<number[]>([])
  get itemIds() { return this.#itemIds.value }
  set itemIds(v) { this.#itemIds.value = v }

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
  #layerMarkerMap = ref<Record<string, MarkerWithExtra[]>>({})
  get layerMarkerMap() { return this.#layerMarkerMap.value }

  // ========== 内部状态 ==========
  #existItemIds = ref<Set<number>>(new Set())
  get existItemIds() { return this.#existItemIds.value }

  #conditions = ref<Map<string, Condition>>(new Map())
  get conditions() { return this.#conditions.value }

  #crasheCheck = () => {
    const crashedItemIds: number[] = []
    const validItemIds: number[] = []
    for (const id of this.itemIds)
      (this.existItemIds.has(id) ? crashedItemIds : validItemIds).push(id)
    return { crashedItemIds, validItemIds }
  }

  isConditionAddable = computed(() => this.area && this.itemType && this.itemIds.length)

  #isPreRendering = ref(false)
  get isPreRendering() { return this.#isPreRendering.value }

  /** 仅在改变条件时改变，以便各图层进行脏检查 */
  #conditionStateId = ref(crypto.randomUUID())
  get conditionStateId() { return this.#conditionStateId.value }

  initLayerMarkerMap = () => Promise.all(LAYER_CONFIGS.map(async ({ code, areaCodes = [] }) => {
    // 筛选出只存在于当前图层的点位
    let itemIdsInThisLayer: number[] = []
    this.conditions.forEach((condition) => {
      if (!areaCodes.includes(condition.area.code as string))
        return
      itemIdsInThisLayer = itemIdsInThisLayer.concat(condition.items)
    })
    const markers = (await db.marker.where('itemIdList').anyOf(itemIdsInThisLayer).toArray()).map(marker => ({
      ...marker,
      extraObject: ExtraJSON.parse(marker.extra ?? '{}'),
    }))
    this.#layerMarkerMap.value[code] = markers
  }))

  requestMarkersUpdate = async () => {
    const layer = useMap().map.value?.baseLayer
    if (!layer)
      return
    this.#conditionStateId.value = crypto.randomUUID()
    await this.initLayerMarkerMap()
    const items = (await db.item.bulkGet([...this.existItemIds])).filter(Boolean) as API.ItemVo[]
    await this.initIconMap(items)
    layer.forceUpdate()
  }

  addCondition = async () => {
    if (!this.area || !this.itemType || !this.itemIds.length)
      return
    const { crashedItemIds, validItemIds } = this.#crasheCheck()
    if (!validItemIds.length) {
      this.#info('所选组合条件已经存在，不能重复选择')
      return
    }
    try {
      this.#isPreRendering.value = true
      this.#info(crashedItemIds.length ? `${crashedItemIds.length} 项物品已经存在，已为你自动去重` : '所选条件已加入到条件列表')
      validItemIds.forEach(id => this.existItemIds.add(id))
      const conditionId = crypto.randomUUID()
      this.conditions.set(conditionId, {
        area: this.area,
        type: this.itemType,
        items: validItemIds,
      })
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
    const condition = this.conditions.get(id)
    this.conditions.delete(id)
    if (!condition)
      return
    condition.items.forEach(itemId => this.existItemIds.delete(itemId as number))
    await this.requestMarkersUpdate()
  }

  clearCondition = async () => {
    if (!this.conditions.size)
      return
    this.conditions.clear()
    this.existItemIds.clear()
    await this.requestMarkersUpdate()
  }

  #info = (message: string) => {
    logger.info(message)
  }

  #handleError = (err: Error) => {
    logger.error(err)
  }
}
