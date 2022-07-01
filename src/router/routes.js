
const routes = [
  {
    path: '/',
    component: () => import('pages/Index.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
