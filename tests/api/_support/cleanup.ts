import Apis from '@/api/alova'
import { loginAsTestAccount } from './auth'

/** 本次测试过程中创建的后端用户 id */
const createdUserIds = new Set<number>()

/** 登记待清理的用户 */
export const registerUserForCleanup = (userId: number) => {
  createdUserIds.add(userId)
}

/**
 * 删除本次测试创建的全部用户。
 *
 * 删除用户需要 ADMIN 权限，而用例中途可能已切换为低权限账号，
 * 或被 401/403 响应清空了登录态，因此清理前先以测试主账号重新登录。
 * 单个删除失败不中断整体清理（例如用例自身已覆盖删除行为）。
 */
export const cleanupCreatedUsers = async () => {
  if (!createdUserIds.size)
    return

  await loginAsTestAccount().catch(() => {})

  for (const userId of [...createdUserIds])
    await Apis.user.deleteUser({ pathParams: { workId: userId } }).catch(() => {})

  createdUserIds.clear()
}
