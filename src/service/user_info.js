import { computed } from "vue";
import { Cookies } from "quasar";

function set_user_data(data = {}) {
  set_user_token(data.access_token, data.expires_in);
  set_user_id(data.userId);
  set_user_roles(data.userRoles || [], data.expires_in);
  set_user_refresh_token(data.refresh_token);
  set_user_expires(data.expires_in);
}

function get_user_token() {
  return Cookies.get("_yuanshen_dadian_token");
}

function set_user_token(token = "", expires = "") {
  Cookies.set("_yuanshen_dadian_token", token, {
    expires: `${expires}s`,
  });
}

function get_user_id() {
  return Number(localStorage.getItem("_yuanshen_dadian_user"));
}

function set_user_id(user_id = 0) {
  localStorage.setItem("_yuanshen_dadian_user", user_id);
}

function get_user_roles() {
  const rolesStr = Cookies.get("_yuanshen_dadian_roles");
  const roles = (rolesStr || "").split(",").filter((v) => v);
  return roles;
}

function set_user_roles(roles = [], expires = "") {
  Cookies.set("_yuanshen_dadian_roles", roles.join(","), {
    expires: `${expires}s`,
  });
}

function get_user_refresh_token() {
  return localStorage.getItem("_yuanshen_dadian_refresh_token");
}

function set_user_refresh_token(refresh_token = "") {
  localStorage.setItem("_yuanshen_dadian_refresh_token", refresh_token);
}

function get_user_expires() {
  const expire_time = localStorage.getItem("_yuanshen_dadian_expire");
  return Number(expire_time);
}

function set_user_expires(expire_in = 0) {
  localStorage.setItem(
    "_yuanshen_dadian_expire",
    Date.now() + expire_in * 1e3 - 360e3
  );
}

const user_roles = computed(() => get_user_roles());

function has_user_role(role = "") {
  return user_roles.value.indexOf(role) !== -1;
}

const is_admin = computed(
  () => has_user_role("ADMIN") || has_user_role("MAP_MANAGER")
);

const is_neigui = computed(
  () =>
    has_user_role("MAP_NEIGUI") ||
    has_user_role("MAP_MANAGER") ||
    has_user_role("ADMIN")
);

const is_expired = computed(() => {
  const expire = get_user_expires();
  return Date.now() > expire;
});

export {
  set_user_data,
  get_user_token,
  set_user_token,
  get_user_id,
  set_user_id,
  get_user_roles,
  set_user_roles,
  get_user_refresh_token,
  set_user_refresh_token,
  get_user_expires,
  set_user_expires,
  has_user_role,
  is_admin,
  is_neigui,
  is_expired,
};
