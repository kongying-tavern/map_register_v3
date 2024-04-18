import { defineStore } from 'pinia'
import { useUserInfoStore } from '.'
import { RoleTypeEnum } from '@/shared'

const { MAP_MANAGER, MAP_PUNCTUATE, ADMIN, MAP_NEIGUI, MAP_USER, VISITOR } = RoleTypeEnum

/** 角色对应 hiddenFlag 的可访问性 */
export const ACCESS_COMPOSITE_MAP = {
  [ADMIN]: 0b1111,
  [MAP_MANAGER]: 0b1011,
  [MAP_NEIGUI]: 0b1111,
  [MAP_PUNCTUATE]: 0b1011,
  [MAP_USER]: 0b1001,
  [VISITOR]: 0b1001,
}

/** 权限表 */
const ACCESS_CONTROL_CONFIG = {
  /** 点位关联 */
  MARKER_LINK: 0b110000,

  /** 点位新增 */
  MARKER_CREATE: 0b111100,

  /** 点位编辑 */
  MARKER_EDIT: 0b111100,

  /** 点位批量编辑 */
  MARKER_BATCH_EDIT: 0b110000,

  /** 测试服点位 */
  MARKER_NEIGUI: 0b101000,

  /** 测试服地区 */
  MARKER_EASTER_EGG: 0b000000,
}

/** 全局权限控制 */
export const useAccessStore = defineStore('global-access', () => {
  const userInfoStore = useUserInfoStore()

  const roleBinaryFlag = computed(() => {
    const flag = [0, 0, 0, 0, 0, 0]
    flag[userInfoStore.userRoleLevel] = 1
    return Number.parseInt(flag.reverse().join(''), 2)
  })

  /** 获取某功能/资源权限 */
  const get = <K extends keyof typeof ACCESS_CONTROL_CONFIG>(key: K): boolean => {
    return (roleBinaryFlag.value & ACCESS_CONTROL_CONFIG[key]) > 0
  }

  return {
    get,
  }
})
