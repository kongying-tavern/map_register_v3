export class RouteQuery {
  /** 注册邀请码 */
  static readonly Invitation = {
    getKey: () => 'invitation',
    stringify: ({ code, username }: RouteQueryInvitation) => {
      return window.btoa(JSON.stringify({
        code,
        username,
      }))
    },
    parse: (value: string) => {
      return JSON.parse(window.atob(value)) as RouteQueryInvitation
    },
  }
}

export interface RouteQueryInvitation {
  code: string
  username: string
}
