import type { RouteRecordRaw } from 'vue-router'
import { RoleTypeEnum } from '@/shared'

// TODO: 后期按模块抽离或做动态化
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: { title: 'Home', icon: 'home' },
    component: () => import('@/layout/LayoutIndex.vue'),
    redirect: '/map', // TODO: 重定向应该是动态获取的
    children: [
      {
        path: '/items',
        meta: {
          title: '物品管理',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageItemManager/ItemManager.vue'),
      },
      {
        path: '/type',
        meta: {
          title: '类型管理',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageTypeManager/TypeManager.vue'),
      },
      {
        path: '/icon',
        meta: {
          title: '图标管理',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageIconManager/IconManager.vue'),
      },
      {
        path: '/users',
        meta: {
          title: '用户管理',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageUserManager/UserManager.vue'),
      },
    ],
  },
  {
    path: '/map',
    meta: {
      title: '地图页',
    },
    component: () => import('@/pages/pageMap/PageMap.vue'),
    children: [],
  },
  {
    path: '/login',
    meta: {
      title: '登录页',
    },
    component: () => import('@/pages/pageLogin/PageLogin.vue'),
  },
]

export default routes
