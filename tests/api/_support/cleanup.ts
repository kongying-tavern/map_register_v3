import Apis from '@/api/alova'
import { loginAsTestAccount } from './auth'

/** 本次测试过程中创建的后端用户 id */
const createdUserIds = new Set<number>()

/** 本次测试过程中创建的后端地区 id */
const createdAreaIds = new Set<number>()

/** 登记待清理的用户 */
export const registerUserForCleanup = (userId: number) => {
  createdUserIds.add(userId)
}

/** 登记待清理的地区 */
export const registerAreaForCleanup = (areaId: number) => {
  createdAreaIds.add(areaId)
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

/**
 * 删除本次测试创建的全部地区。
 *
 * 删除地区会级联移除整棵子树，因此父级被删除后其子级再删除会返回 500；
 * 单个删除失败不中断整体清理，也不视为错误（用例自身可能已经删过）。
 * 孤立地区（parentId 指向不存在的父级）不会被列表接口检索到，
 * 只能依赖此处登记 id 精确回收。
 */
export const cleanupCreatedAreas = async () => {
  if (!createdAreaIds.size)
    return

  await loginAsTestAccount().catch(() => {})

  for (const areaId of [...createdAreaIds])
    await Apis.area.deleteArea({ pathParams: { areaId } }).catch(() => {})

  createdAreaIds.clear()
}
