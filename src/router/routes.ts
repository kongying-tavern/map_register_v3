import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/index.vue'),
  },
  {
    path: '/login',
    component: () => import('@/pages/pageLogin/PageLogin.vue'),
  },
  {
    path: '/users',
    component: () => import('@/pages/pageUserManager/UserManager.vue'),
  },
]

export default routes
