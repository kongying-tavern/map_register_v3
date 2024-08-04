import type { GSMapState } from '@/stores/types/genshin-map-state'

export type ModifierConstructorOptions<T = void> = {
  /** 旧内容表头 */
  label: string
  /**
   * 新内容表头
   * @default '修改为'
   */
  replaceLabel?: string
  /**
   * 预览项的高度
   * @default 32
   */
  previewHeight?: number
  /** 字段名 */
  field: keyof GSMapState.MarkerWithRenderConfig
  /** 修改类型 */
  type: string
  /** 用于自定义修改行为，当设置此值时，将会跳过通过接口进行的修改 */
  customModify?: (markers: API.MarkerVo[], meta: API.TweakConfigMetaVo) => void | Promise<void>
  /** 将会覆盖 Modifier 的 getValue 行为 */
  customGetValue?: (data: GSMapState.MarkerWithRenderConfig, isOld: boolean, meta?: API.TweakConfigMetaVo) => unknown
} & T

interface Strategy<T> {
  label: string
  modify: (data: T, meta: Required<API.TweakConfigVo>['meta']) => T
  cardComp: () => Promise<Component>
}

export abstract class Modifier<T = void> {
  options: Required<ModifierConstructorOptions<T>>

  abstract previewer: Component
  card: Component
  typeLabel: string
  modify: Strategy<GSMapState.MarkerWithRenderConfig>['modify']

  getValue = (data: GSMapState.MarkerWithRenderConfig, isOld: boolean, meta?: API.TweakConfigMetaVo) => {
    const { field, customGetValue } = this.options
    if (customGetValue)
      return customGetValue(data, isOld, meta)
    return data[field]
  }

  constructor(
    options: ModifierConstructorOptions<T>,
    strategies: Record<string, Strategy<GSMapState.MarkerWithRenderConfig>>,
  ) {
    const {
      replaceLabel = '修改为',
      ...rest
    } = options

    this.options = {
      ...rest,
      replaceLabel,
    } as Required<ModifierConstructorOptions<T>>

    const strategy = strategies[this.options.type]
    if (!strategy)
      throw new Error(`字段 "${this.options.field}" 未实现策略 "${this.options.type}"`)

    this.card = defineAsyncComponent(strategy.cardComp)
    this.typeLabel = strategy.label
    this.modify = strategy.modify
  }
}
