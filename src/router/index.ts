import type { RouterHistory, RouterScrollBehavior } from 'vue-router'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import routes from './routes'

const history: RouterHistory = ({
  history: createWebHistory,
  hash: createWebHashHistory,
  memory: createMemoryHistory,
}[import.meta.env.VITE_ROUTER_MODE] ?? createWebHashHistory)(import.meta.env.BASE_URL)

const scrollBehavior: RouterScrollBehavior = () => ({
  top: 0,
  left: 0,
  behavior: 'smooth',
})

const router = createRouter({
  routes,
  history,
  scrollBehavior,
})

export { router }
