import 'vue-router'
import type * as ElIcons from '@element-plus/icons-vue'
import type { RoleTypeEnum } from '@/shared'

declare module 'vue-router' {
  /** 拓展元信息类型 */
  interface RouteMeta {
    /** 路由标题 */
    title?: string

    /** 路由图标 - 可用于面包屑、侧边栏 */
    icon?: keyof typeof ElIcons

    /**
     * 路由权限等级
     * 1. 未指定时，没有访问限制
     * 2. 已指定时，用户权限需大于等于指定角色的等级才可以访问
     */
    role?: RoleTypeEnum

    /** 是否显示 loading 页面 */
    loading?: boolean

    /** 在已登录的情况下进入该路由会被导航至指定位置 */
    redirectOnLogin?: string
  }
}
