import { defineStore } from 'pinia'
import { userHook } from './hooks'
import type { UserPreference } from './types'
import { getDefaultPreference } from './types'
import { useArchiveStore, useUserAuthStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

export const usePreferenceStore = defineStore('global-user-preference', () => {
  const internalUpdateFlag = ref(false)

  const { data: preference, refresh: _updateUserPreference } = useFetchHook<UserPreference, [userId: number]>({
    initialValue: getDefaultPreference(),
    onRequest: async (userId) => {
      const queryPreference = await db.user.get(userId)
      internalUpdateFlag.value = true
      return {
        ...getDefaultPreference(),
        ...queryPreference,
        ...useArchiveStore().currentArchive.body.Preference,
      }
    },
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

  const syncUserPreference = async () => {
    const userId = _getUserId()
    if (userId === undefined)
      return

    if (internalUpdateFlag.value) {
      internalUpdateFlag.value = false
      return
    }

    await db.user.put(JSON.parse(JSON.stringify({ id: userId, ...preference.value })))

    const archiveStore = useArchiveStore()
    archiveStore.currentArchive.body.Preference = preference.value

    await useArchiveStore().saveArchiveToSlot(archiveStore.currentArchive.slotIndex)
  }

  watchDebounced(preference, syncUserPreference, {
    deep: true,
    debounce: 1000,
  })

  return {
    // states
    preference,

    // actions
    updateUserPreference,
  }
})

userHook.onInfoChange(usePreferenceStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() && await store.updateUserPreference()
})
