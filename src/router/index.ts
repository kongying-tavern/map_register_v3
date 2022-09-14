import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import type { RouterHistory, RouterScrollBehavior } from 'vue-router'
import routes from './routes'
import { beforeEachGuard } from './guards'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */
export default route((/* { store, ssrContext } */) => {
  const history: RouterHistory = (
    {
      history: createWebHistory,
      hash: createWebHashHistory,
      memory: createMemoryHistory,
    }[import.meta.env.VITE_ROUTER_MODE] ?? createWebHashHistory
  )(import.meta.env.BASE_URL)

  const scrollBehavior: RouterScrollBehavior = () => ({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })

  const Router = createRouter({
    routes,
    history,
    scrollBehavior,
  })

  Router.beforeEach(
    beforeEachGuard(Router, {
      debug: import.meta.env.DEV,
    }),
  )

  return Router
})
