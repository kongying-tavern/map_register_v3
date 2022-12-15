import type { InjectionKey, Ref } from 'vue'

/** 地区列表 */
export const areaListInjection: InjectionKey<Ref<API.AreaVo[]>> = Symbol('areaList')
/** 物品列表 */
export const itemListInjection: InjectionKey<Ref<API.ItemVo[]>> = Symbol('itemList')
/** 图标表 */
export const iconMapInjection: InjectionKey<Ref<Record<string, string>>> = Symbol('iconMap')
/** 点位列表 */
export const markerListInjection: InjectionKey<Ref<API.MarkerVo[]>> = Symbol('markerList')
