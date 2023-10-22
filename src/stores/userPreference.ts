import { defineStore } from 'pinia'
import { UserHook } from './utils'
import { useUserAuthStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'
import type { Condition } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'

/**
 * ### 用户首选项
 * #### 索引必须遵守如下命名格式
 * `${namespace}.${scope}`
 */
export interface UserPreference {
  /** 用户 id */
  'id'?: number

  /** 侧边栏折叠状态 */
  'mapSiderMenu.state.collapse'?: boolean

  /** 筛选器存储的预设 */
  'markerFilter.setting.presets'?: FilterPreset[]

  /** 筛选器选择的Tab */
  'markerFilter.state.step'?: number

  /** 筛选器选择的地区 */
  'markerFilter.state.areaCode'?: string

  /** 筛选器选择的分类 */
  'markerFilter.state.itemTypeId'?: number

  /** 筛选器选择的物品 */
  'markerFilter.state.itemIds'?: number
}

/** 筛选器预设 */
export interface FilterPreset {
  name: string
  conditions: Record<string, Condition>
}

export const usePreferenceStore = defineStore('user-preference', () => {
  const internalUpdateFlag = ref(false)

  const { data: preference, refresh: _updateUserPreference } = useFetchHook<UserPreference, [userId: number]>({
    initialValue: {},
    onRequest: async (userId) => {
      const queryPreference = await db.user.get(userId)
      internalUpdateFlag.value = true
      return queryPreference ?? {}
    },
  })

  const updateUserPreference = async () => {
    const { auth, validateToken } = useUserAuthStore()
    if (!validateToken() || auth.userId === undefined || preference.value.id === auth.userId)
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

const logger = new Logger('[user preference]')

UserHook.onInfoChange(usePreferenceStore, async (store) => {
  logger.info('update preference')
  await store.updateUserPreference()
})
