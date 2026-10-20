import Apis from '@/api/alova'
import { registerUserForCleanup } from './cleanup'

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
