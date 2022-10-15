import { LocalStorage } from 'quasar'

const KEY_ACCESS_TOKEN = '__ys_dadian_access_token'
const KEY_REFRESH_TOKEN = '__ys_dadian_refresh_token'
const KEY_EXPIRES = '__ys_dadian_expires'
const KEY_USER_ID = '__ys_dadian_user_id'
const KEY_USER_ROLES = '__ys_dadian_user_roles'

export interface UserAuthOptions {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expiresTime?: number
  userId?: string
  userRoles?: string[]
}

/** 将用户凭证存储到本地 */
export const saveUser = (auth: UserAuthOptions = {}) => {
  const {
    access_token = '',
    refresh_token = '',
    expires_in = 3600,
    expiresTime = new Date().getTime() + expires_in * 1e3,
    userId = '0',
    userRoles = [],
  } = auth

  LocalStorage.set(KEY_ACCESS_TOKEN, access_token)
  LocalStorage.set(KEY_REFRESH_TOKEN, refresh_token)
  LocalStorage.set(KEY_EXPIRES, expiresTime)
  LocalStorage.set(KEY_USER_ID, userId)
  LocalStorage.set(KEY_USER_ROLES, userRoles)
}

export const getUserToken = () => {
  return LocalStorage.getItem(KEY_ACCESS_TOKEN)
}

export const validateUserToken = (debug = false) => {
  const expires: number | null = LocalStorage.getItem(KEY_EXPIRES)
  if (!expires || !getUserToken())
    return false
  debug
    && console.log(
      `token expires in ${
        (expires - new Date().valueOf()) / 1000 / 60
        } min`,
    )
  return expires > new Date().valueOf()
}
