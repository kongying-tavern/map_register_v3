import { defineStore } from 'pinia'
import { userHook } from './hooks'
import type { UserPreference } from './types'
import { getDefaultPreference } from './types'
import { useUserAuthStore } from '@/stores'
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
      }
    },
  })

  const updateUserPreference = async () => {
    const { auth } = useUserAuthStore()
    if (auth.userId === undefined || preference.value.id === auth.userId)
      return
    await _updateUserPreference(auth.userId)
  }

  const syncUserPreference = async () => {
    if (internalUpdateFlag.value) {
      internalUpdateFlag.value = false
      return
    }
    await db.user.put(JSON.parse(JSON.stringify(preference.value)))
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
