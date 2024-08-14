import { defineStore } from 'pinia'
import type { MaybeRef } from 'vue'
import { filter, fromEvent, map } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import { CONTROL_KEYS } from '@/shared'
import { ShortcutKeyUtil } from '@/utils'

export const useShortcutStore = defineStore('shortcut-keys', () => {
  const isPaused = ref(false)

  const keydown$ = fromEvent<KeyboardEvent>(document.body, 'keydown', {
    passive: false,
  })

  const shortcut$ = keydown$.pipe(
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
