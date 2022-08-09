import {
  LocalStorage
} from 'quasar';

const KEY_ACCESS_TOKEN = '__ys_dadian_access_token';
const KEY_REFRESH_TOKEN = '__ys_dadian_refresh_token';
const KEY_EXPIRES = '__ys_dadian_expires';
const KEY_USER_ID = '__ys_dadian_user_id';
const KEY_USER_ROLES = '__ys_dadian_user_roles';

export function saveUser(auth = {}) {
  let accessToken = auth.access_token || '';
  let refreshToken = auth.refresh_token || '';
  let expiresIn = +auth.expires_in | 3600
  let expiresTime = (new Date()).getTime() + expiresIn * 1e3
  let userId = parseInt(auth.userId) | 0
  let userRoles = auth.userRoles || []

  LocalStorage.set(KEY_ACCESS_TOKEN, accessToken);
  LocalStorage.set(KEY_REFRESH_TOKEN, refreshToken);
  LocalStorage.set(KEY_EXPIRES, expiresTime);
  LocalStorage.set(KEY_USER_ID, userId);
  LocalStorage.set(KEY_USER_ROLES, userRoles);
}
