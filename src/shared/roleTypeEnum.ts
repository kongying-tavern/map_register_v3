/** 角色类型标记 */
export enum RoleTypeEnum {
  /** 系统管理员 */
  ADMIN = 'ADMIN',
  /** 地图管理员 */
  MAP_MANAGER = 'MAP_MANAGER',
  /** 测试打点员 */
  MAP_NEIGUI = 'MAP_NEIGUI',
  /** 地图打点员 */
  MAP_PUNCTUATE = 'MAP_PUNCTUATE',
  /** 地图用户 */
  MAP_USER = 'MAP_USER',
  /** 匿名用户 */
  VISITOR = 'VISITOR',
}

const ROLE_NAME_MAP = {
  [RoleTypeEnum.ADMIN]: '系统管理员',
  [RoleTypeEnum.MAP_MANAGER]: '地图管理员',
  [RoleTypeEnum.MAP_NEIGUI]: '测试服打点员',
  [RoleTypeEnum.MAP_PUNCTUATE]: '地图打点员',
  [RoleTypeEnum.MAP_USER]: '地图用户',
  [RoleTypeEnum.VISITOR]: '游客',
}

export const RoleLevel: Record<RoleTypeEnum, number> = {
  [RoleTypeEnum.ADMIN]: 5,
  [RoleTypeEnum.MAP_MANAGER]: 4,
  [RoleTypeEnum.MAP_NEIGUI]: 3,
  [RoleTypeEnum.MAP_PUNCTUATE]: 2,
  [RoleTypeEnum.MAP_USER]: 1,
  [RoleTypeEnum.VISITOR]: 0,
}

export const ROLES_MAP: Record<string, string> = new Proxy(ROLE_NAME_MAP, {
  get: (target, key, receiver) => {
    return key in target ? Reflect.get(target, key, receiver) : '未知'
  },
  set: () => {
    return false
  },
})
