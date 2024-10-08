import type { RouteRecordRaw } from 'vue-router'
import { RoleTypeEnum } from '@/shared'

const isDev = import.meta.env.DEV

const backendRoutes: RouteRecordRaw[] = [
  {
    path: '/items',
    meta: {
      title: '物品',
      icon: 'Files',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageItemManager/ItemManager.vue'),
  },
  {
    path: '/area',
    meta: {
      title: '地区',
      icon: 'Place',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageAreaManager/AreaManager.vue'),
  },
  {
    path: '/markers',
    meta: {
      title: '点位',
      icon: 'Location',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageMarkerManager/MarkerManager.vue'),
  },
  {
    path: '/type',
    meta: {
      title: '类型',
      icon: 'Box',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageTypeManager/TypeManager.vue'),
  },
  {
    path: '/icon',
    meta: {
      title: '图标',
      icon: 'Picture',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageIconManager/IconManager.vue'),
  },
  {
    path: '/common-items',
    meta: {
      title: '公共物品',
      icon: 'Files',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageCommonItemManager/CommonItemManager.vue'),
  },
  {
    path: '/users',
    meta: {
      title: '用户',
      icon: 'User',
      role: RoleTypeEnum.ADMIN,
    },
    component: () => import('@/pages/pageUserManager/UserManager.vue'),
  },
  {
    path: '/score',
    meta: {
      title: '用户评分',
      icon: 'Star',
      role: RoleTypeEnum.ADMIN,
    },
    component: () => import('@/pages/pageScoreManager/ScoreManager.vue'),
  },
  {
    path: '/history',
    meta: {
      title: '历史记录',
      icon: 'Memo',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageHistory/PageHistory.vue'),
  },
  {
    path: '/notice',
    meta: {
      title: '公告',
      icon: 'ChatLineRound',
      role: RoleTypeEnum.MAP_MANAGER,
    },
    component: () => import('@/pages/pageNoticeManager/PageNoticeManager.vue'),
  },
]

isDev && backendRoutes.push({
  path: '/developer',
  meta: {
    title: '开发者',
    icon: 'Cpu',
    role: RoleTypeEnum.ADMIN,
  },
  component: () => import('@/pages/pageDeveloper/PageDeveloper.vue'),
})

// TODO: 后期按模块抽离或做动态化
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: { title: '地图', icon: 'HomeFilled' },
    component: () => import('@/layout/LayoutIndex.vue'),
    redirect: '/map',
    // 管理页直接从属于根目录
    children: backendRoutes,
  },
  {
    path: '/map',
    meta: {
      title: '地图',
      loading: true,
      role: RoleTypeEnum.MAP_USER,
      icon: 'MapLocation',
    },
    component: () => import('@/pages/pageMapV2/PageMapV2.vue'),
  },
  {
    path: '/login',
    meta: {
      title: '登录',
      redirectOnLogin: '/map',
    },
    component: () => import('@/pages/pageLogin/PageLogin.vue'),
  },
  {
    path: '/register',
    meta: {
      title: '注册',
      redirectOnLogin: '/map',
    },
    component: () => import('@/pages/pageRegister/PageRegister.vue'),
  },
  {
    path: '/404',
    meta: {
      title: '404',
    },
    component: () => import('@/pages/pageNotFound/PageNotFound.vue'),
  },
  {
    path: '/error',
    meta: {
      title: '',
    },
    component: () => import('@/pages/pageError/pageError.vue'),
  },
]

export default routes
