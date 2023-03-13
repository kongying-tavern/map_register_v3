import type { InjectionKey, Ref } from 'vue'
import type { UnionMarkerVo } from '@/pages/pageMap/hooks'
import type { GenshinMap } from '@/pages/pageMap/core'

/** 地图实例 */
export const mapInjection: InjectionKey<Ref<GenshinMap | null>> = Symbol('genshinMap')
/** 地区列表 */
export const areaListInjection: InjectionKey<Ref<API.AreaVo[]>> = Symbol('areaList')
/** 物品列表 */
export const itemListInjection: InjectionKey<Ref<API.ItemVo[]>> = Symbol('itemList')
/** 物品类型列表 */
export const itemTypeInjection: InjectionKey<Ref<API.ItemTypeVo[]>> = Symbol('itemType')
/** 图标表 */
export const iconMapInjection: InjectionKey<Ref<Record<string, string>>> = Symbol('iconMap')
/** 点位列表 */
export const markerListInjection: InjectionKey<Ref<UnionMarkerVo[]>> = Symbol('markerList')
/** 地下模式 */
export const underGroundModeInjection: InjectionKey<Ref<boolean>> = Symbol('underGroundMode')
