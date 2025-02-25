import type { MaybeRef } from 'vue'
import { CONTROL_KEYS, globalKeydown$ } from '@/shared'
import { ShortcutKeyUtil } from '@/utils'
import { useSubscription } from '@vueuse/rxjs'
import { defineStore } from 'pinia'
import { filter, map } from 'rxjs'

export const useShortcutStore = defineStore('shortcut-keys', () => {
  const isPaused = ref(false)

  const shortcut$ = globalKeydown$.pipe(
    filter(ev => [
      !isPaused.value,
      !ev.repeat,
      !CONTROL_KEYS.has(ev.key.toLowerCase()),
    ].every(Boolean)),
    map((ev) => {
      const hotKeys = ShortcutKeyUtil.buildKeysFromEvent(ev)
      const value = ShortcutKeyUtil.stringify(hotKeys)
      return { ev, value }
    }),
    filter(({ value }) => Boolean(value)),
  )

  const useKeys = (keys: MaybeRef<string | undefined>, triggerCallback?: () => void) => {
    const eventhook = createEventHook<void>()

    useSubscription(shortcut$.pipe(
      filter(({ value }) => {
        const hotKeys = toValue(keys)
        return Boolean(hotKeys) && value === toValue(keys)
      }),
    ).subscribe(() => {
      eventhook.trigger()
      triggerCallback?.()
    }))

    return {
      onKeysTrigger: eventhook.on,
    }
  }

  return {
    isPaused,
    shortcut$,
    useKeys,
  }
})
