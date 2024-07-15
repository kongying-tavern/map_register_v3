import { defineStore } from 'pinia'
import { useUserInfoStore } from '.'
import { RoleTypeEnum } from '@/shared'

const { MAP_MANAGER, MAP_PUNCTUATE, ADMIN, MAP_NEIGUI, MAP_USER, VISITOR } = RoleTypeEnum

/**
 * 角色对应 hiddenFlag 的可访问性
 * 从低位到高位分别对应:
 * 0. 显示
 * 1. 隐藏
 * 2. 测试服
 * 3. 彩蛋
 */
export const ACCESS_HIDDEN_FLAG = {
  [ADMIN]: 0b1111,
  [MAP_MANAGER]: 0b1011,
  [MAP_NEIGUI]: 0b1111,
  [MAP_PUNCTUATE]: 0b1011,
  [MAP_USER]: 0b1001,
  [VISITOR]: 0b1001,
}

/** 权限表 */
const ACCESS_CONTROL = {
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
  const userInfoStore = useUserInfoStore()

  const roleBinaryFlag = computed(() => {
    const flag = [0, 0, 0, 0, 0, 0]
    flag[userInfoStore.userRoleLevel] = 1
    return Number.parseInt(flag.reverse().join(''), 2)
  })

  const checkHiddenFlag = (hiddenFlag?: number) => {
    const { code } = userInfoStore.userRole ?? {}
    if (hiddenFlag === undefined || !code)
      return false
    const binaryHiddenFlag = Number.parseInt(
      Array
        .from({ length: hiddenFlag + 1 })
        .fill(0)
        .with(hiddenFlag, 1)
        .reverse()
        .join(''),
      2,
    )
    return (ACCESS_HIDDEN_FLAG[code] & binaryHiddenFlag) > 0
  }

  /** 获取某功能/资源权限 */
  const get = <K extends keyof typeof ACCESS_CONTROL>(key: K): boolean => {
    return (roleBinaryFlag.value & ACCESS_CONTROL[key]) > 0
  }

  const hasNeigui = computed(() => get('HIDDEN_FLAG_NEIGUI'))

  return {
    hasNeigui,
    get,
    checkHiddenFlag,
  }
})
