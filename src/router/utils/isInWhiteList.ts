import type { RouteLocationNormalized } from 'vue-router'

/** 路由地址白名单 */
export const ROUTE_WHITE_LIST = Object.freeze([
  '/login',
])

/** 判断跳转目标是否处于白名单内 */
export const isInWhiteList = (to: RouteLocationNormalized) => {
  return ROUTE_WHITE_LIST.includes(to.path)
}
