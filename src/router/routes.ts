import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
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
      title: 'Error',
    },
    component: () => import('@/pages/pageError/pageError.vue'),
  },
]

export default routes
