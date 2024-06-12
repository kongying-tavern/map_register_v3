import { defineStore } from 'pinia'
import { userHook } from './hooks'
import type { UserPreference } from './types'
import { getDefaultPreference } from './types'
import { useArchiveStore, useUserAuthStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

export const usePreferenceStore = defineStore('global-user-preference', () => {
  const internalUpdateFlag = ref(false)

  const archiveStore = useArchiveStore()

  const _resolve = shallowRef<() => void>()

  const ready = shallowRef(new Promise<void>((resolve) => {
    _resolve.value = resolve
  }))

  const { data: preference, refresh: _updateUserPreference, onSuccess } = useFetchHook<UserPreference, [userId: number]>({
    initialValue: getDefaultPreference(),
    onRequest: async (userId) => {
      const queryPreference = await db.user.get(userId)
      internalUpdateFlag.value = true
      return {
        ...getDefaultPreference(),
        ...queryPreference,
        ...archiveStore.currentArchive.body.Preference,
      }
    },
  })

  onSuccess(() => {
    _resolve.value?.()
  })

  // 获取当前用户的 userId
  const _getUserId = () => {
    const { auth } = useUserAuthStore()
    return auth.userId
  }

  const updateUserPreference = async () => {
    const userId = _getUserId()
    if (userId === undefined)
      return
    await _updateUserPreference(userId)
  }

  // 存档更新时，更新用户首选项
  watch(() => archiveStore.currentArchive.body.Preference, updateUserPreference)

  /** 同步首选项更新至存档 */
  const syncUserPreference = async () => {
    const userId = _getUserId()
    if (userId === undefined)
      return

    if (internalUpdateFlag.value) {
      internalUpdateFlag.value = false
      return
    }

    await db.user.put(JSON.parse(JSON.stringify({ id: userId, ...preference.value })))

    archiveStore.currentArchive.body.Preference = preference.value

    await archiveStore.saveArchiveToSlot(archiveStore.currentArchive.slotIndex)
  }

  watchDebounced(preference, syncUserPreference, {
    deep: true,
    debounce: 500,
  })

  return {
    // states
    ready,
    preference,

    // actions
    updateUserPreference,
  }
})

userHook.onInfoChange(usePreferenceStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() && await store.updateUserPreference()
})
