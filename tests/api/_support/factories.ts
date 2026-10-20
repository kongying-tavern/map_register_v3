import type { AreaVo } from '@/api/alova/globals'
import Apis from '@/api/alova'
import { registerAreaForCleanup, registerUserForCleanup } from './cleanup'

/** 测试用户名统一前缀，便于人工识别与兜底清理 */
export const TEST_USER_PREFIX = '__apitest_'

/** 测试用户统一口令（需满足后端密码强度要求） */
export const TEST_USER_PASSWORD = 'apitest123456'

let seed = 0

/** 生成全局唯一用户名，避免与真实用户冲突 */
const uniqueUsername = () =>
  `${TEST_USER_PREFIX}${Date.now()}${(seed++).toString(36)}${Math.random().toString(36).slice(2, 7)}`

/**
 * 注册一个临时用户并登记清理。
 * 后端注册接口默认分配 MAP_USER 角色，因此该用户可用于权限阶梯用例。
 */
export const createTestUser = async () => {
  const username = uniqueUsername()
  const { data: userId } = await Apis.user.registerUser({
    data: { username, password: TEST_USER_PASSWORD },
  })
  if (!userId)
    throw new Error('测试用户注册失败：后端未返回用户 id')
  registerUserForCleanup(userId)
  return { username, password: TEST_USER_PASSWORD, userId }
}

/** 测试地区名称统一前缀，便于人工识别与兜底清理 */
export const TEST_AREA_NAME_PREFIX = '__apitest_'

let areaSeed = 0

/** 生成全局唯一地区代码标签（后端与前端约定代码仅允许 [A-Z0-9_-.]+） */
const uniqueAreaTag = () =>
  `${Date.now()}${(areaSeed++).toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

/** 生成带测试前缀的地区名称 */
export const testAreaName = (tag: string) => `${TEST_AREA_NAME_PREFIX}${tag}`

/**
 * 以任意载荷创建地区并登记清理，返回新地区 id。
 *
 * - `createArea` 只返回 id，不返回完整地区数据；
 * - 载荷完全透传，便于构造边界用例（例如指向不存在父级的孤立地区）。
 */
export const createTestArea = async (data: AreaVo) => {
  const { data: areaId } = await Apis.area.createArea({ data })
  if (typeof areaId !== 'number')
    throw new Error('测试地区创建失败：后端未返回地区 id')
  registerAreaForCleanup(areaId)
  return areaId
}

/** 创建一个测试根地区（parentId = -1），返回新地区 id */
export const createTestRootArea = async (overrides: AreaVo = {}) => {
  const tag = uniqueAreaTag()
  return await createTestArea({
    name: testAreaName(tag),
    code: `C:${tag}`,
    parentId: -1,
    sortIndex: 0,
    ...overrides,
  })
}

/** 在指定父级下创建测试子地区，返回新地区 id */
export const createTestChildArea = async (parent: AreaVo, overrides: AreaVo = {}) => {
  const tag = uniqueAreaTag()
  return await createTestArea({
    name: testAreaName(tag),
    code: `A:${parent.code!.split(':')[1]}:${tag}`,
    parentId: parent.id,
    sortIndex: 0,
    ...overrides,
  })
}
