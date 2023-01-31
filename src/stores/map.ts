import { defineStore } from 'pinia'

const mapData = useUrlSearchParams('history', {
  removeNullishValues: true,
  initialValue: {
    areaCode: undefined as undefined | string,
    step: 0,
    typeId: undefined as undefined | number,
    zoom: 0 as undefined | number,
    center: undefined as undefined | [number, number],
    // 这里用 iconName 而不是 itemId 的原因：
    // 1. 不同地区存在相同的物品，但其 itemId 不同
    // TODO 可能存在的问题：
    // 1. 不同的物品拥有同一个 iconName
    iconName: undefined as undefined | string,
    showAuditedMarker: true as undefined | boolean,
    showPunctuateMarker: false as undefined | boolean,
    onlyUnderground: false as undefined | boolean,
    showAreaName: false as undefined | boolean,
  },
})

/** 用于对 url 参数进行类型转换的包装函数 */
const format = <T>(v: T, fn: (pv: T) => NonNullable<T>) => {
  return v === undefined ? v : fn(v)
}

/** 将 url 的字符串型布尔值转换为实际布尔类型 */
const strBoolean = (v: boolean | string = false) => {
  return typeof v === 'boolean' ? v : v === 'true'
}

const mapStore = defineStore('map-info', {
  state: () => ({
    /** 已选择的二级地区 code */
    areaCode: mapData.areaCode,
    /** 已选择的筛选步骤 */
    step: format(mapData.step, Number),
    /** 已选择的物品类型 */
    typeId: format(mapData.typeId, Number),
    /** 地图缩放等级 */
    zoom: format(mapData.zoom, Number),
    /** 视图中心点位置 */
    center: format(mapData.center, (res = [0, 0] as [number, number]) => (res).map(Number) as [number, number]),
    /** 已选择的物品的图标名称 */
    iconName: mapData.iconName,
    /** 显示已审核点位 */
    showAuditedMarker: format(mapData.showAuditedMarker, strBoolean),
    /** 显示待审核点位 */
    showPunctuateMarker: format(mapData.showPunctuateMarker, strBoolean),
    /** 仅显示地下点位 */
    onlyUnderground: format(mapData.onlyUnderground, strBoolean),
    /** 显示地区名称 */
    showAreaName: format(mapData.onlyUnderground, strBoolean),
  }),
  actions: {
    /** 重置 url 地图参数 */
    reset() {
      this.areaCode = undefined
      this.step = 0
      this.typeId = undefined
      this.zoom = undefined
      this.center = undefined
      this.iconName = undefined
      this.showAuditedMarker = true
      this.showPunctuateMarker = false
      this.onlyUnderground = false
    },
  },
})

export const useMapStore = () => {
  const store = mapStore()
  store.$subscribe((_, state) => {
    for (const key in state)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapData as any)[key] = state[key as keyof typeof mapData]
  })
  return store
}
