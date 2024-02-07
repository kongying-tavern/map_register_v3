/* eslint-disable */

declare namespace API {
  type SysTokenVO = {
    grant_type: 'password'
    username: string
    password: string
  };

  type SysRefreshVO = {
    grant_type: 'refresh_token'
    refresh_token: string
  };

  type SysOauthHeader = SysTokenVO | SysRefreshVO;

  type SysToken = {
    access_token: string
    token_type: string
    refresh_token: string
    expires_in: number
    scope: string
    userRoles: string[]
    userId: number
    jti: string
  };
}
