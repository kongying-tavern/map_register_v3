const routes = [
  {
    path: "/",
    component: () => import("pages/Index.vue"),
  },
  {
    path: "/login",
    component: () => import("pages/Login.vue"),
  },
];

export default routes;
