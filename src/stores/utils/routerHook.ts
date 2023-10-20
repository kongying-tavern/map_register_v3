import type { StateTree, Store, StoreDefinition, _ActionsTree, _GettersTree } from 'pinia'

export type RouterHookType =
  | 'onBeforeRouterEnter'

export class RouterHook {
  static #callbackMap: Record<string, {
    storeDefinition: StoreDefinition
    callback: (store: Store) => void | Promise<void>
  }[]> = {}

  static onBeforeRouterEnter = <Id extends string = string, S extends StateTree = StateTree, G = _GettersTree<S>, A = _ActionsTree>(
    storeDefinition: StoreDefinition<Id, S, G, A>, callback: (store: Store<Id, S, G, A>) => void | Promise<void>,
  ) => {
    if (!this.#callbackMap.onBeforeRouterEnter)
      this.#callbackMap.onBeforeRouterEnter = []
    this.#callbackMap.onBeforeRouterEnter.push({
      storeDefinition: storeDefinition as unknown as StoreDefinition,
      callback: callback as unknown as (store: Store) => void | Promise<void>,
    })
  }

  static applyCallbacks = (name: RouterHookType) => Promise.all(this.#callbackMap[name]?.map(async ({ storeDefinition, callback }) => {
    const store = storeDefinition()
    await callback(store)
  }) ?? [])
}
