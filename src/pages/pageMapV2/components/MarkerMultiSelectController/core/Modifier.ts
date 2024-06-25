import type { GSMapState } from '@/stores/types/genshin-map-state'

export type ModifierConstructorOptions<T = void> = {
  label: string
  /** @default '修改为' */
  replaceLabel?: string
  /** 字段名 */
  field: keyof GSMapState.MarkerWithRenderConfig
  /** 修改类型 */
  type: string
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

  getValue = (data: GSMapState.MarkerWithRenderConfig) => {
    const { field } = this.options
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
