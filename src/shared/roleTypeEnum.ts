/** 角色类型标记 */
export enum RoleTypeEnum {
  /** 系统管理员 level 5 */
  ADMIN = 'ADMIN',
  /** 地图管理员 level 4 */
  MAP_MANAGER = 'MAP_MANAGER',
  /** 测试打点员 level 3 */
  MAP_NEIGUI = 'MAP_NEIGUI',
  /** 地图打点员 level 2 */
  MAP_PUNCTUATE = 'MAP_PUNCTUATE',
  /** 地图用户 level 1 */
  MAP_USER = 'MAP_USER',
  /** 匿名用户 level 0 */
  VISITOR = 'VISITOR',
}

export const RoleLevel: Record<RoleTypeEnum, number> = {
  [RoleTypeEnum.ADMIN]: 5,
  [RoleTypeEnum.MAP_MANAGER]: 4,
  [RoleTypeEnum.MAP_NEIGUI]: 3,
  [RoleTypeEnum.MAP_PUNCTUATE]: 2,
  [RoleTypeEnum.MAP_USER]: 1,
  [RoleTypeEnum.VISITOR]: 0,
}
