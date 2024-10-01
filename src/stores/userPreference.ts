import { defineStore } from 'pinia'
import { useArchiveStore } from '@/stores'

export const usePreferenceStore = defineStore('global-user-preference', () => {
  const archiveStore = useArchiveStore()

  return {
    // states
    preference: archiveStore.currentArchive.body.Preference,
  }
})
