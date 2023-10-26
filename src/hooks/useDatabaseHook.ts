import type { Dexie } from 'dexie'

type DexieTableHookType =
  | 'creating'
  | 'deleting'
  | 'reading'
  | 'updating'

export const useDatabaseHook = (table: Dexie.Table, cb: () => void, types: DexieTableHookType[]) => {
  types.forEach(hookType => table.hook(hookType).subscribe(cb))

  onDeactivated(() => {
    types.forEach(hookType => table.hook(hookType).unsubscribe(cb))
  })
}
