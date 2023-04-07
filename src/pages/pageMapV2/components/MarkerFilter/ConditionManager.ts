import { ElNotification } from 'element-plus'
import db from '@/database'
import { useMap } from '@/pages/pageMapV2/hooks'

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: API.ItemVo[]
}

export class ConditionManager {
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

  updateMarkers = async () => {
    const markers = this.existItemIds.size
      ? await db.marker.where('itemIdList').anyOf([...this.existItemIds]).toArray()
      : []
    useMap().map.value?.renderMarkers(markers)
  }

  addCondition = async () => {
    if (!this.area || !this.itemType || !this.itemIds.length)
      return
    const { crashedItemIds, validItemIds } = this.#crasheCheck()
    if (!validItemIds.length) {
      this.#info('所选组合条件已经存在，不能重复选择')
      return
    }
    this.#info(crashedItemIds.length ? `${crashedItemIds.length} 项物品已经存在，已为你自动去重` : '所选条件已加入到条件列表')
    validItemIds.forEach(id => this.existItemIds.add(id))
    const conditionId = crypto.randomUUID()
    this.conditions.set(conditionId, {
      area: this.area,
      type: this.itemType,
      items: (await db.item.bulkGet(validItemIds)).filter(Boolean) as API.ItemVo[],
    })
    await this.updateMarkers()
  }

  deleteCondition = async (id: string) => {
    const condition = this.conditions.get(id)
    this.conditions.delete(id)
    if (!condition)
      return
    condition.items.forEach(item => this.existItemIds.delete(item.itemId as number))
    await this.updateMarkers()
  }

  clearCondition = async () => {
    this.conditions.clear()
    this.existItemIds.clear()
    await this.updateMarkers()
  }

  #info = (message: string) => {
    ElNotification.info({
      message,
      position: 'bottom-left',
    })
  }
}
