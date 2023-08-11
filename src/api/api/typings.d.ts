
declare namespace API {
  type RBoolean = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: boolean;
    users?: Record<string, any>;
    time?: string;
  };

  type SysUserSmallVo = {
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** QQ */
    qq?: string;
    /** 手机号 */
    phone?: string;
    /** 头像链接 */
    logo?: string;
  };

  type TagTypeVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 分类名称 */
    name?: string;
    /** 父级分类ID（-1为根分类） */
    parent?: number;
    /** 是否为末端类型 */
    isFinal?: boolean;
  };

  type RLong = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: number;
    users?: Record<string, any>;
    time?: string;
  };

  type RouteVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 路线名称 */
    name?: string;
    /** 路线描述 */
    content?: string;
    /** 点位顺序数组 */
    markerList?: Record<string, any>[];
    /** 显隐等级 */
    hiddenFlag?: number;
    /** 视频地址 */
    video?: string;
    /** 额外信息 */
    extra?: Record<string, any>;
    /** 创建人昵称 */
    creatorNickname?: string;
  };

  type MarkerPunctuateVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 点位提交ID */
    punctuateId?: number;
    /** 原有点位ID */
    originalMarkerId?: number;
    /** 点位名称 */
    markerTitle?: string;
    /** 点位物品列表 */
    itemList?: string;
    /** 点位坐标 */
    position?: string;
    /** 点位说明 */
    content?: string;
    /** 额外特殊字段 */
    extra?: Record<string, any>;
    /** 点位图片 */
    picture?: string;
    /** 点位初始标记者 */
    markerCreatorId?: number;
    /** 点位图片上传者 */
    pictureCreatorId?: number;
    /** 点位视频 */
    videoPath?: string;
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 点位提交者ID */
    author?: number;
    /** 状态;0:暂存 1:审核中 2:不通过 */
    status?: number;
    /** 审核备注 */
    auditRemark?: string;
    /** 操作类型;1: 新增 2: 修改 3: 删除 */
    methodType?: number;
    /** 点位刷新时间 */
    refreshTime?: number;
  };

  type MarkerItemLinkVo = {
    /** 物品ID */
    itemId?: number;
    /** 物品于该点位数量 */
    count?: number;
    /** 图标标签 */
    iconTag?: string;
  };

  type MarkerVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 点位签戳（用于兼容旧点位ID） */
    markerStamp?: string;
    /** 点位名称 */
    markerTitle?: string;
    /** 点位坐标 */
    position?: string;
    /** 点位物品列表 */
    itemList?: MarkerItemLinkVo[];
    /** 点位说明 */
    content?: string;
    /** 点位图片 */
    picture?: string;
    /** 点位初始标记者 */
    markerCreatorId?: number;
    /** 点位图片上传者 */
    pictureCreatorId?: number;
    /** 点位视频 */
    videoPath?: string;
    /** 点位刷新时间;单位:毫秒 */
    refreshTime?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 额外特殊字段 */
    extra?: Record<string, any>;
  };

  type ItemTypeVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 图标标签 */
    iconTag?: string;
    /** 类型名 */
    name?: string;
    /** 类型补充说明 */
    content?: string;
    /** 父级类型ID（无父级则为-1） */
    parentId?: number;
    /** 是否为末端类型 */
    isFinal?: boolean;
    /** 隐藏标记 */
    hiddenFlag?: number;
    /** 排序 */
    sortIndex?: number;
  };

  type RListLong = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: number[];
    users?: Record<string, any>;
    time?: string;
  };

  type ItemVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 物品名称 */
    name?: string;
    /** 地区ID（须确保是末端地区） */
    areaId?: number;
    /** 默认刷新时间;单位:毫秒 */
    defaultRefreshTime?: number;
    /** 默认描述模板;用于提交新物品点位时的描述模板 */
    defaultContent?: string;
    /** 默认数量 */
    defaultCount?: number;
    /** 图标标签 */
    iconTag?: string;
    /** 图标样式类型 */
    iconStyleType?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 物品排序 */
    sortIndex?: number;
    /** 特殊物品标记;二进制表示；低位第一位：前台是否显示 */
    specialFlag?: number;
    /** 物品类型ID列表 */
    typeIdList?: number[];
  };

  type IconTypeVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 分类名 */
    name?: string;
    /** 父级分类ID（-1为根分类） */
    parent?: number;
    /** 是否为末端类型 */
    isFinal?: boolean;
  };

  type IconVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 图标名称 */
    name?: string;
    /** 图标类型ID列表 */
    typeIdList?: number[];
    /** 图标url */
    url?: string;
  };

  type AreaVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 地区名称 */
    name?: string;
    /** 地区代码 */
    code?: string;
    /** 地区说明 */
    content?: string;
    /** 图标标签 */
    iconTag?: string;
    /** 父级地区ID（无父级则为-1） */
    parentId?: number;
    /** 是否为末端地区 */
    isFinal?: boolean;
    /** 权限屏蔽标记 */
    hiddenFlag?: number;
    /** 额外标记;低位第一位：前台是否显示 */
    specialFlag?: number;
    /** 排序 */
    sortIndex?: number;
  };

  type SysUserUpdateVo = {
    userId?: number;
    nickname?: string;
    qq?: string;
    phone?: string;
    logo?: string;
    roleId?: number;
  };

  type SysUserPasswordUpdateVo = {
    userId?: number;
    password?: string;
    oldPassword?: string;
  };

  type SysUserRegisterVo = {
    username?: string;
    password?: string;
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
    users?: Record<string, any>;
    time?: string;
  };

  type SysUserVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** QQ */
    qq?: string;
    /** 手机号 */
    phone?: string;
    /** 头像链接 */
    logo?: string;
    /** 角色ID */
    roleId?: number;
  };

  type PageAndTypeSearchVo = {
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
    /** 父级类型ID列表 */
    typeIdList?: number[];
  };

  type PageListVoTagTypeVo = {
    record?: TagTypeVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoTagTypeVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoTagTypeVo;
    users?: Record<string, any>;
    time?: string;
  };

  type TagVo = {
    /** 乐观锁 */
    version?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 标签名 */
    tag?: string;
    /** 标签类型ID列表 */
    typeIdList?: number[];
    /** 图标ID */
    iconId?: number;
    /** 图标url */
    url?: string;
  };

  type RTagVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: TagVo;
    users?: Record<string, any>;
    time?: string;
  };

  type TagSearchVo = {
    /** 标签名列表 */
    tagList?: string[];
    /**  图标标签分类列表 */
    typeIdList?: number[];
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type PageListVoTagVo = {
    record?: TagVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoTagVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoTagVo;
    users?: Record<string, any>;
    time?: string;
  };

  type ScoreParamsVo = {
    /** 统计范围 */
    scope?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 统计颗粒度 */
    span?: 'DAY';
    generatorId?: number;
  };

  type RObject = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: Record<string, any>;
    users?: Record<string, any>;
    time?: string;
  };

  type RouteSearchVo = {
    /** 路线名称模糊搜索字段 */
    namePart?: string;
    /** 创建人昵称模糊搜索字段，此字段不能与创建人id字段共存 */
    creatorNicknamePart?: string;
    /** 创建人id，此字段不能与昵称模糊搜索字段共存 */
    creatorId?: string;
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type PageListVoRouteVo = {
    record?: RouteVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoRouteVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoRouteVo;
    users?: Record<string, any>;
    time?: string;
  };

  type PageSearchVo = {
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type RListRouteVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: RouteVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type PageListVoMarkerPunctuateVo = {
    record?: MarkerPunctuateVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoMarkerPunctuateVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoMarkerPunctuateVo;
    users?: Record<string, any>;
    time?: string;
  };

  type PunctuateSearchVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 地区ID列表 */
    areaIdList?: number[];
    /** 物品ID列表 */
    itemIdList?: number[];
    /** 类型ID列表 */
    typeIdList?: number[];
    /** 提交者ID列表 */
    authorList?: number[];
  };

  type RListMarkerPunctuateVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: MarkerPunctuateVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type PageListVoMarkerVo = {
    record?: MarkerVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoMarkerVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoMarkerVo;
    users?: Record<string, any>;
    time?: string;
  };

  type MarkerSearchVo = {
    /** 地区ID列表 */
    areaIdList?: number[];
    /** 物品ID列表 */
    itemIdList?: number[];
    /** 类型ID列表 */
    typeIdList?: number[];
  };

  type RListMarkerVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: MarkerVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type RListItemTypeVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ItemTypeVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type PageListVoItemTypeVo = {
    record?: ItemTypeVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoItemTypeVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoItemTypeVo;
    users?: Record<string, any>;
    time?: string;
  };

  type ItemAreaPublicVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 物品ID */
    itemId?: number;
    /** 物品名称 */
    name?: string;
    /** 地区ID（须确保是末端地区） */
    areaId?: number;
    /** 默认刷新时间;单位:毫秒 */
    defaultRefreshTime?: number;
    /** 默认描述模板;用于提交新物品点位时的描述模板 */
    defaultContent?: string;
    /** 默认数量 */
    defaultCount?: number;
    /** 图标标签 */
    iconTag?: string;
    /** 图标样式类型 */
    iconStyleType?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 物品排序 */
    sortIndex?: number;
    /** 特殊物品标记;二进制表示；低位第一位：前台是否显示 */
    specialFlag?: number;
    /** 物品类型ID列表 */
    typeIdList?: number[];
  };

  type PageListVoItemAreaPublicVo = {
    record?: ItemAreaPublicVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoItemAreaPublicVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoItemAreaPublicVo;
    users?: Record<string, any>;
    time?: string;
  };

  type ItemSearchVo = {
    /** 末端物品类型ID列表 */
    typeIdList?: number[];
    /** 末端地区ID列表 */
    areaIdList?: number[];
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type PageListVoItemVo = {
    record?: ItemVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoItemVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoItemVo;
    users?: Record<string, any>;
    time?: string;
  };

  type RListItemVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ItemVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type PageListVoIconTypeVo = {
    record?: IconTypeVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoIconTypeVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoIconTypeVo;
    users?: Record<string, any>;
    time?: string;
  };

  type RIconVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: IconVo;
    users?: Record<string, any>;
    time?: string;
  };

  type IconSearchVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 图标ID列表 */
    iconIdList?: number[];
    /** 创建者ID */
    creator?: number;
    /** 图标分类列表 */
    typeIdList?: number[];
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type PageListVoIconVo = {
    record?: IconVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoIconVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoIconVo;
    users?: Record<string, any>;
    time?: string;
  };

  type HistorySearchVo = {
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
    /** 记录类型 */
    type?: number;
    /** 类型ID(配合记录类型使用) */
    id?: number[];
  };

  type HistoryVo = {
    /** 乐观锁 */
    version?: number;
    /** ID */
    id?: number;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新人 */
    updaterId?: number;
    /** 更新时间 */
    updateTime?: string;
    /** 内容 */
    content?: string;
    /** MD5 */
    md5?: string;
    /** 操作数据类型;1地区; 2图标; 3物品; 4点位; 5标签 */
    type?: number;
    /** IPv4 */
    ipv4?: string;
    tid?: number;
  };

  type PageListVoHistoryVo = {
    record?: HistoryVo[];
    total?: number;
    size?: number;
  };

  type RPageListVoHistoryVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoHistoryVo;
    users?: Record<string, any>;
    time?: string;
  };

  type RAreaVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: AreaVo;
    users?: Record<string, any>;
    time?: string;
  };

  type AreaSearchVo = {
    /** 父级ID */
    parentId?: number;
    /** 是否遍历子地区 */
    isTraverse?: boolean;
    /** 数据等级(hidden_flag范围) */
    hiddenFlagList?: number[];
  };

  type RListAreaVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: AreaVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type RSysUserVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysUserVo;
    users?: Record<string, any>;
    time?: string;
  };

  type RListSysRoleVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysRoleVo[];
    users?: Record<string, any>;
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

  type RSysArchiveVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysArchiveVo;
    users?: Record<string, any>;
    time?: string;
  };

  type SysArchiveVo = {
    /** 存档时间 */
    time?: string;
    /** 存档 */
    archive?: string;
    /** 存档历史下标 */
    historyIndex?: number;
  };

  type RSysArchiveSlotVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysArchiveSlotVo;
    users?: Record<string, any>;
    time?: string;
  };

  type SysArchiveSlotVo = {
    version?: number;
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
    archive?: SysArchiveVo[];
  };

  type RListSysArchiveSlotVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: SysArchiveSlotVo[];
    users?: Record<string, any>;
    time?: string;
  };

  type RString = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: string;
    users?: Record<string, any>;
    time?: string;
  };

  type RListString = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: string[];
    users?: Record<string, any>;
    time?: string;
  };
}
