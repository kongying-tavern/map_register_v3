import type { RouteRecordRaw } from 'vue-router'

// TODO: 后期按模块抽离或做动态化
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: { title: 'Home', icon: 'home' },
    component: () => import('@/layout/LayoutIndex.vue'),
    redirect: '/users', // TODO: 重定向应该是动态获取的
    children: [
      {
        path: '/users',
        meta: {
          title: '用户管理',
          icon: 'widgets',
        },
        component: () => import('@/pages/pageUserManager/UserManager.vue'),
      },
      {
        path: '/items',
        meta: {
          title: '物品管理',
          icon: 'widgets',
        },
        component: () => import('@/pages/pageItemManager/ItemManager.vue'),
      },
      {
        path: '/type',
        meta: {
          title: '类型管理',
          icon: 'widgets',
        },
        component: () => import('@/pages/pageTypeManager/TypeManager.vue'),
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
