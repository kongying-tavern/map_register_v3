import type { RouteRecordRaw } from 'vue-router'
import { RoleTypeEnum } from '@/shared'

// TODO: 后期按模块抽离或做动态化
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: { title: '地图', icon: 'HomeFilled' },
    component: () => import('@/layout/LayoutIndex.vue'),
    redirect: '/map',
    // 管理页直接从属于根目录
    children: [
      {
        path: '/items',
        meta: {
          title: '物品管理',
          icon: 'Files',
          roles: [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER],
        },
        component: () => import('@/pages/pageItemManager/ItemManager.vue'),
      },
      {
        path: '/common-items',
        meta: {
          title: '公共物品管理',
          icon: 'Files',
          roles: [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER],
        },
        component: () => import('@/pages/pageCommonItemManager/CommonItemManager.vue'),
      },
      {
        path: '/type',
        meta: {
          title: '类型管理',
          icon: 'Connection',
          roles: [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER],
        },
        component: () => import('@/pages/pageTypeManager/TypeManager.vue'),
      },
      {
        path: '/icon',
        meta: {
          title: '图标管理',
          icon: 'Picture',
          roles: [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER],
        },
        component: () => import('@/pages/pageIconManager/IconManager.vue'),
      },
      {
        path: '/users',
        meta: {
          title: '用户管理',
          icon: 'User',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageUserManager/UserManager.vue'),
      },
      {
        path: '/markers',
        meta: {
          title: '点位管理',
          icon: 'Marker',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageMarkerManager/MarkerManager.vue'),
      },
      {
        path: '/area',
        meta: {
          title: '地区管理',
          icon: 'Marker',
          roles: [RoleTypeEnum.ADMIN],
        },
        component: () => import('@/pages/pageAreaManager/AreaManager.vue'),
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
  {
    path: '/register',
    meta: {
      title: '注册页',
    },
    component: () => import('@/pages/pageRegister/PageRegister.vue'),
  },
]

export default routes
