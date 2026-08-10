export interface InvitationFilterOptions {
  /** `keyof SysUserInvitationVo` */
  key: string
  /** `+` or `-` */
  value?: string
}

export interface InvitationSortOptions {
  /** `keyof SysUserInvitationVo` */
  key: string
  /** `+` or `-` */
  type: string
}
