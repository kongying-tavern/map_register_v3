import type { RouteRecordRaw } from 'vue-router'

// TODO: 后期按模块抽离或做动态化
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: {
      title: 'Home',
      icon: 'home',
    },
    component: () => import('@/layout/LayoutIndex.vue'),
    redirect: '/users',
    children: [
      {
        path: '/users',
        meta: {
          title: '用户管理',
          icon: 'widgets',
        },
        component: () => import('@/pages/pageUserManager/UserManager.vue'),
      },
    ],
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
