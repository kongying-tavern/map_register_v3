import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { user_token } from "../service/user_info";
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.SERVER
    ? createMemoryHistory
    : import.meta.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.VUE_ROUTER_BASE),
  });
  Router.beforeEach((to, from, next) => {
    // 鉴定token是否过期
    if (user_token.value === null && to.path !== "/login") {
      next({ path: "/login" });
    } else if (user_token.value !== null && to.path === "/login") {
      next({ path: "/" });
    } else {
      next();
    }
  });
  return Router;
});
