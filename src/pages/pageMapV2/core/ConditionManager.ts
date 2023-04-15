import { IconManager } from './IconManager'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

export class ConditionManager extends IconManager {
  // ========== 对外绑定的数据 ==========
  #areaCode = ref<string>()
  get areaCode() { return this.#areaCode.value }
  set areaCode(v) {
    if (v === this.areaCode)
      return
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
  #area = asyncComputed(() => this.areaCode === undefined
    ? undefined
    : db.area.where('code').equals(this.areaCode).first())

  get itemType() { return this.#itemType.value }
  #itemType = asyncComputed(() => {
    return this.itemTypeId === undefined
      ? undefined
      : db.itemType.where('typeId').equals(this.itemTypeId).first()
  })

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

  requestMarkersUpdate = async () => {
    const layer = useMap().map.value?.baseLayer
    if (!layer)
      return
    const items = (await db.item.bulkGet([...this.existItemIds])).filter(Boolean) as API.ItemVo[]
    await this.initIconMap(items)
    layer.forceUpdate()
    this.#conditionStateId.value = crypto.randomUUID()
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
    console.log(message)
  }

  #handleError = (err: Error) => {
    console.log(err)
  }
}
