import { defineStore } from 'pinia'

const mapData = useUrlSearchParams('history', {
  removeNullishValues: true,
  initialValue: {
    areaId: 2 as undefined | number,
    step: 0 as undefined | number,
    typeId: undefined as undefined | number,
    zoom: 0 as undefined | number,
    center: undefined as undefined | [number, number],
    // 这里用 iconName 而不是 itemId 的原因：
    // 1. 不同地区存在相同的物品，但其 itemId 不同
    // TODO 可能存在的问题：
    // 1. 不同的物品拥有同一个 iconName
    iconName: undefined as undefined | string,
  },
})

const format = <T>(v: T, fn: (pv: T) => NonNullable<T>) => {
  return v === undefined ? v : fn(v)
}

const mapStore = defineStore('map-info', {
  state: () => ({
    areaId: format(mapData.areaId, Number),
    step: format(mapData.step, Number),
    typeId: format(mapData.typeId, Number),
    zoom: format(mapData.zoom, Number),
    center: format(mapData.center, (res = [0, 0] as [number, number]) => (res).map(Number) as [number, number]),
    iconName: mapData.iconName,
  }),
  getters: {

  },
})

export const useMapStore = () => {
  const store = mapStore()
  store.$subscribe((_, state) => {
    for (const key in state)
      (mapData as any)[key] = state[key as keyof typeof mapData]
  })
  return store
}
