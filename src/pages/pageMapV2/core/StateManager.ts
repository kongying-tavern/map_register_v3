/* eslint-disable @typescript-eslint/no-explicit-any */

export type EffectCallbackFn<T> = (target: T) => void
export type EffectMap<T> = Map<string | symbol, Set<EffectCallbackFn<T>>>

/** 状态管理器，用法类似 vue 的 customRef，但可以额外注册、删除状态更新时的副作用，并且具有一个预定义的状态类型 */
export class StateManager<T, S extends Record<string, any>> {
  #target: T

  #state: S

  #stateProxy: S
  get state() { return this.#stateProxy }

  #effectMap: EffectMap<T> = new Map()

  constructor(target: T, initialState: S) {
    this.#target = target
    this.#state = initialState

    this.#stateProxy = new Proxy(this.#state, {
      get: (obj, key, reciver) => {
        return Reflect.get(obj, key, reciver)
      },
      set: (obj, key, newValue, reciver) => {
        Reflect.set(obj, key, newValue, reciver)
        this.#effectMap.get(key)?.forEach(cb => cb(this.#target))
        return true
      },
    })
  }

  get = <K extends keyof S>(key: K) => this.state[key]

  set = <K extends keyof S>(key: K, val: S[K]) => this.state[key] = val

  /** 注册副作用 */
  registerEffect = <K extends keyof S>(key: K, cb: EffectCallbackFn<T>) => {
    const effects = this.#effectMap.get(key as string)
    if (effects) {
      effects.add(cb)
      return
    }
    this.#effectMap.set(key as string, new Set([cb]))
  }

  /** 注销副作用 */
  unregisterEffect = <K extends keyof S>(key: K, cb: EffectCallbackFn<T>) => {
    const effects = this.#effectMap.get(key as string)
    if (!effects)
      return
    return effects.delete(cb)
  }

  /** 清除全部副作用 */
  clear = () => {
    this.#effectMap.forEach((effects) => {
      effects.clear()
    })
    this.#effectMap.clear()
  }

  /** 获取深度克隆的副作用 Map */
  cloneEffects = () => {
    const map: EffectMap<T> = new Map()
    this.#effectMap.forEach((effects, key) => {
      const set = new Set<EffectCallbackFn<T>>()
      effects.forEach(cb => set.add(cb))
      map.set(key, set)
    })
    return map
  }
}
