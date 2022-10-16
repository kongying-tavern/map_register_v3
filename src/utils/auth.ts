export interface UserAuthOptions {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expiresTime?: number
  userId?: string
  userRoles?: string[]
}

const authInfo = useLocalStorage<Partial<UserAuthOptions>>('__ys_dadian_auth', {})

/** 将用户凭证存储到本地 */
export const saveUser = (auth: UserAuthOptions = {}) => {
  authInfo.value = auth
}

export const getUserToken = () => {
  return authInfo.value.access_token
}

export const validateUserToken = (debug = false) => {
  const expires: number | null = authInfo.value.expiresTime ?? 0
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
