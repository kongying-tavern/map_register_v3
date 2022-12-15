
declare namespace API {
  type SysRoleLinkVo = {
    /** 用户ID */
    userId?: number;
    /** 角色ID */
    roleId?: number;
  };

  type RBoolean = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: boolean;
    time?: string;
  };

  type SysUserUpdateDto = {
    userId?: number;
    nickname?: string;
    qq?: string;
    phone?: string;
    logoUrl?: string;
  };

  type SysUserPasswordUpdateDto = {
    userId?: number;
    password?: string;
    oldPassword?: string;
  };

  type SysUserRegisterVo = {
    username?: string;
    password?: string;
  };

  type RLong = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: number;
    time?: string;
  };

  type SysUserSearchVo = {
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    sort?: string[];
  };

  type PageListVoSysUserVo = {
    record?: SysUserVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoSysUserVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoSysUserVo;
    time?: string;
  };

  type SysRoleVo = {
    /** 角色ID */
    id?: number;
    /** 角色名 */
    name?: string;
    /** 角色代码（英文大写） */
    code?: string;
    /** 角色层级（越大级别越高） */
    sort?: number;
  };

  type SysUserVo = {
    /** 用户ID */
    id?: number;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** QQ */
    qq?: string;
    /** 手机号 */
    phone?: string;
    /** 头像链接 */
    logoUrl?: string;
    /** 角色列表 */
    roleList?: SysRoleVo[];
  };

  type RSysUserVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysUserVo;
    time?: string;
  };

  type RListSysRoleVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysRoleVo[];
    time?: string;
  };

  type ArchiveVo = {
    /** 存档ID */
    id?: number;
    /** 存档名称 */
    name?: string;
    /** 槽位顺序 */
    slotIndex?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 存档 */
    archive?: string;
    /** 存档历史下标 */
    historyIndex?: number;
  };

  type RArchiveVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ArchiveVo;
    time?: string;
  };

  type ArchiveHistoryVo = {
    /** 存档ID */
    id?: number;
    /** 存档名称 */
    name?: string;
    /** 槽位顺序 */
    slotIndex?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 存档列表 */
    archive?: string[];
    /** 存档历史下标 */
    historyIndex?: number;
  };

  type RArchiveHistoryVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ArchiveHistoryVo;
    time?: string;
  };

  type RListArchiveVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ArchiveVo[];
    time?: string;
  };

  type RListArchiveHistoryVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ArchiveHistoryVo[];
    time?: string;
  };
}
