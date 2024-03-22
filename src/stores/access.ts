import { defineStore } from 'pinia'
import { useUserInfoStore } from '.'
import { RoleTypeEnum } from '@/shared'

const { MAP_PUNCTUATE } = RoleTypeEnum

/** 权限表 */
const ACCESS_CONTROL_CONFIG = {
  /** 点位关联 */
  MARKER_LINK: MAP_PUNCTUATE,

  /** 点位新增 */
  MARKER_CREATE: MAP_PUNCTUATE,

  /** 点位编辑 */
  MARKER_EDIT: MAP_PUNCTUATE,

  /** 点位批量编辑 */
  MARKER_BATCH_EDIT: MAP_PUNCTUATE,
}

/** 全局权限控制 */
export const useAccessStore = defineStore('global-authorisation', () => {
  const userInfoStore = useUserInfoStore()

  /** 获取某功能/资源权限 */
  const get = <K extends keyof typeof ACCESS_CONTROL_CONFIG>(key: K): boolean => {
    return userInfoStore.hasRole(ACCESS_CONTROL_CONFIG[key])
  }

  return {
    get,
  }
})
