import { defineStore } from 'pinia'
import type { UserPreference } from './types'
import { useArchiveStore } from '@/stores'

export const usePreferenceStore = defineStore('global-user-preference', () => {
  const archiveStore = useArchiveStore()

  const model = <K extends keyof UserPreference>(key: K, defaultValue: () => UserPreference[K]) => computed({
    get: () => {
      return archiveStore.currentArchive.body.Preference[key] ?? defaultValue()
    },
    set: (v) => {
      archiveStore.currentArchive.body.Preference[key] = v
    },
  }) as WritableComputedRef<NonNullable<UserPreference[K]>>

  const advancedFilter = model('markerFilter.filter.advancedFilter', () => [])
  const advancedFilterCache = model('markerFilter.filter.advancedFilterCache', () => [])
  const autoNext = model('markerFilter.setting.autoNext', () => false)
  const areaCode = model('markerFilter.state.areaCode', () => '')
  const defaultMarkingItemId = model('markerFilter.state.defaultMarkingItemId', () => -1)
  const enableLoggers = model('developer.setting.enableLoggers', () => [])
  const filterType = model('markerFilter.setting.filterType', () => 'basic')
  const itemIds = model('markerFilter.state.itemIds', () => [])
  const itemTypeId = model('markerFilter.state.itemTypeId', () => -1)
  const maxLogs = model('developer.setting.maxLogs', () => 100)
  const noticeRead = model('notice.state.read', () => [])
  const noticeShowTime = model('notice.state.showTime', () => 0)
  const parentAreaCode = model('markerFilter.state.parentAreaCode', () => '')
  const presets = model('markerFilter.setting.presets', () => [])
  const settingActivedKey = model('settingPanel.state.activedKey', () => '')
  const step = model('markerFilter.state.step', () => -1)
  const tabName = model('mapSiderMenu.state.tabName', () => '')

  return {
    advancedFilter,
    advancedFilterCache,
    autoNext,
    areaCode,
    defaultMarkingItemId,
    enableLoggers,
    filterType,
    itemIds,
    itemTypeId,
    maxLogs,
    noticeRead,
    noticeShowTime,
    parentAreaCode,
    presets,
    settingActivedKey,
    step,
    tabName,
    preference: archiveStore.currentArchive.body.Preference,
  }
})
