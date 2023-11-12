import { ref, computed } from "vue";
import { Cookies } from "quasar";

const user_refresh_interval = 300e3;
const user_refresh_gap = 360e3;

function set_user_data(data = {}) {
  set_user_token(data.access_token, data.expires_in);
  set_user_refresh_token(data.refresh_token);
  set_user_expires(data.expires_in);
  set_user_id(data.userId);
  set_user_roles(data.userRoles || [], data.expires_in);
}

// Access token
const user_token = ref(get_user_token());
function set_user_token(token = "", expires = "") {
  Cookies.set("_yuanshen_dadian_token", token, {
    expires: `${expires}s`,
  });
  user_token.value = get_user_token();
}

function get_user_token() {
  return Cookies.get("_yuanshen_dadian_token");
}

// Refresh token
const user_refresh_token = ref(get_user_refresh_token());
function set_user_refresh_token(refresh_token = "") {
  localStorage.setItem("_yuanshen_dadian_refresh_token", refresh_token);
  user_refresh_token.value = get_user_refresh_token();
}

function get_user_refresh_token() {
  return localStorage.getItem("_yuanshen_dadian_refresh_token");
}

// Expires
const user_expires = ref(get_user_expires());
function set_user_expires(expire_in = 0) {
  localStorage.setItem(
    "_yuanshen_dadian_expire",
    Date.now() + expire_in * 1e3 - user_refresh_gap
  );
  user_expires.value = get_user_expires();
}

function get_user_expires() {
  const expire_time = localStorage.getItem("_yuanshen_dadian_expire");
  return Number(expire_time);
}

// User id
const user_id = ref(get_user_id());
function set_user_id(uid = 0) {
  localStorage.setItem("_yuanshen_dadian_user", uid);
  user_id.value = get_user_id();
}

function get_user_id() {
  return Number(localStorage.getItem("_yuanshen_dadian_user"));
}

const user_roles = ref(get_user_roles());
function set_user_roles(roles = [], expires = "") {
  Cookies.set("_yuanshen_dadian_roles", roles.join(","), {
    expires: `${expires}s`,
  });
  user_roles.value = get_user_roles();
}

function get_user_roles() {
  const rolesStr = Cookies.get("_yuanshen_dadian_roles");
  const roles = (rolesStr || "").split(",").filter((v) => v);
  return roles;
}

/**
 * 辅助方法
 */
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

const is_expired = () => Date.now() > user_expires.value;

export {
  user_refresh_interval,
  user_refresh_gap,
  set_user_data,
  user_token,
  user_refresh_token,
  user_expires,
  user_id,
  user_roles,
  is_admin,
  is_neigui,
  is_expired,
};
