export interface InvitationFilterOptions {
  /** `keyof API.SysUserInvitationVo` */
  key: string
  /** `+` or `-` */
  value?: string
}

export interface InvitationSortOptions {
  /** `keyof API.SysUserInvitationVo` */
  key: string
  /** `+` or `-` */
  type: string
}
