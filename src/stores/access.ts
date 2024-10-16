import { defineStore } from 'pinia'
import { useUserStore } from '.'
import { RoleTypeEnum } from '@/shared/roleTypeEnum'

/**
 * 角色对应 hiddenFlag 的可访问性掩码
 * 从低位到高位分别对应:
 * 0. 显示
 * 1. 隐藏
 * 2. 测试服
 * 3. 彩蛋
 */
const HIDDEN_FLAG_BINARY_MASK: Record<string, number> = {
  [RoleTypeEnum.ADMIN]: 0b1111,
  [RoleTypeEnum.MAP_MANAGER]: 0b1011,
  [RoleTypeEnum.MAP_NEIGUI]: 0b1111,
  [RoleTypeEnum.MAP_PUNCTUATE]: 0b1011,
  [RoleTypeEnum.MAP_USER]: 0b1001,
  [RoleTypeEnum.VISITOR]: 0b1001,
}

/** 权限掩码 */
const ACCESS_BINARY_MASK = {
  /** 根管理员组件 */
  ADMIN_COMPONENT: 0b100000,

  /** 管理员组件 */
  MANAGER_COMPONENT: 0b110000,

  /** 点位关联 */
  MARKER_LINK: 0b110000,

  /** 点位新增 */
  MARKER_CREATE: 0b111100,

  /** 点位编辑 */
  MARKER_EDIT: 0b111100,

  /** 点位删除 */
  MARKER_DELETE: 0b110000,

  /** 点位批量编辑 */
  MARKER_BATCH_EDIT: 0b110000,

  /** 测试服项目 */
  HIDDEN_FLAG_NEIGUI: 0b101000,

  /** 隐藏项目 */
  HIDDEN_FLAG_HIDDEN: 0b111100,
}

/** 全局权限控制 */
export const useAccessStore = defineStore('global-access', () => {
  const userStore = useUserStore()

  const roleBinaryMask = computed(() => {
    if (!userStore.info?.role)
      return 0
    return userStore.info.role.mask
  })

  const checkHiddenFlag = (hiddenFlag?: number) => {
    if (!userStore.info?.role?.code || hiddenFlag === undefined)
      return false
    return (HIDDEN_FLAG_BINARY_MASK[userStore.info.role.code] & hiddenFlag) > 0
  }

  /** 获取某功能/资源权限 */
  const get = <K extends keyof typeof ACCESS_BINARY_MASK>(key: K): boolean => {
    return (roleBinaryMask.value & ACCESS_BINARY_MASK[key]) > 0
  }

  const hasNeigui = computed(() => get('HIDDEN_FLAG_NEIGUI'))

  return {
    hasNeigui,
    get,
    checkHiddenFlag,
  }
})
