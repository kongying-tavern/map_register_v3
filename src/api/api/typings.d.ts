declare namespace API {
  interface RBoolean {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: boolean
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface SysUserSmallVo {
    /** 用户名 */
    username?: string
    /** 昵称 */
    nickname?: string
    /** QQ */
    qq?: string
    /** 手机号 */
    phone?: string
    /** 头像链接 */
    logo?: string
  }

  interface TagTypeVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 分类名称 */
    name?: string
    /** 父级分类ID（-1为根分类） */
    parent?: number
    /** 是否为末端类型 */
    isFinal?: boolean
  }

  interface RLong {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: number
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RouteVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 路线名称 */
    name?: string
    /** 路线描述 */
    content?: string
    /** 点位顺序数组 */
    markerList?: unknown[]
    /** 显隐等级 */
    hiddenFlag?: number
    /** 视频地址 */
    video?: string
    /** 额外信息 */
    extra?: Record<string, unknown>
    /** 创建人昵称 */
    creatorNickname?: string
  }

  interface ResourceUploadVo {
    /** 文件路径 */
    filePath?: string
    /** 文件地址 */
    fileUrl?: string
  }

  interface RResourceUploadVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: ResourceUploadVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface MarkerPunctuateVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 点位提交ID */
    punctuateId?: number
    /** 原有点位ID */
    originalMarkerId?: number
    /** 点位名称 */
    markerTitle?: string
    /** 点位物品列表 */
    itemList?: string
    /** 点位坐标 */
    position?: string
    /** 点位说明 */
    content?: string
    /** 额外特殊字段 */
    extra?: Record<string, unknown>
    /** 点位图片 */
    picture?: string
    /** 点位初始标记者 */
    markerCreatorId?: number
    /** 点位图片上传者 */
    pictureCreatorId?: number
    /** 点位视频 */
    videoPath?: string
    /** 隐藏标志 */
    hiddenFlag?: number
    /** 点位提交者ID */
    author?: number
    /** 状态;0:暂存 1:审核中 2:不通过 */
    status?: number
    /** 审核备注 */
    auditRemark?: string
    /** 操作类型;1: 新增 2: 修改 3: 删除 */
    methodType?: number
    /** 点位刷新时间 */
    refreshTime?: number
  }

  interface NoticeVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 频道 */
    channel?: string[]
    /** 标题 */
    title?: string
    /** 内容 */
    content?: string
    /** 有效期开始时间 */
    validTimeStart?: string
    /** 有效期结束时间 */
    validTimeEnd?: string
  }

  interface MarkerItemLinkVo {
    /** 物品ID */
    itemId?: number
    /** 物品于该点位数量 */
    count?: number
    /** 图标标签 */
    iconTag?: string
  }

  interface MarkerVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 点位签戳（用于兼容旧点位ID） */
    markerStamp?: string
    /** 点位名称 */
    markerTitle?: string
    /** 点位坐标 */
    position?: string
    /** 点位物品列表 */
    itemList?: MarkerItemLinkVo[]
    /** 点位说明 */
    content?: string
    /** 点位图片 */
    picture?: string
    /** 点位初始标记者 */
    markerCreatorId?: number
    /** 点位图片上传者 */
    pictureCreatorId?: number
    /** 点位视频 */
    videoPath?: string
    /** 点位刷新时间;单位:毫秒 */
    refreshTime?: number
    /** 隐藏标志 */
    hiddenFlag?: number
    /** 额外特殊字段 */
    extra?: Record<string, unknown>
    /** 点位关联组ID */
    linkageId?: string
  }

  interface ItemTypeVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 图标标签 */
    iconTag?: string
    /** 类型名 */
    name?: string
    /** 类型补充说明 */
    content?: string
    /** 父级类型ID（无父级则为-1） */
    parentId?: number
    /** 是否为末端类型 */
    isFinal?: boolean
    /** 隐藏标记 */
    hiddenFlag?: number
    /** 排序 */
    sortIndex?: number
  }

  interface RListLong {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: number[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface ItemVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 物品名称 */
    name?: string
    /** 地区ID（须确保是末端地区） */
    areaId?: number
    /** 默认刷新时间;单位:毫秒 */
    defaultRefreshTime?: number
    /** 默认描述模板;用于提交新物品点位时的描述模板 */
    defaultContent?: string
    /** 默认数量 */
    defaultCount?: number
    /** 图标标签 */
    iconTag?: string
    /** 图标样式类型 */
    iconStyleType?: number
    /** 隐藏标志 */
    hiddenFlag?: number
    /** 物品排序 */
    sortIndex?: number
    /** 特殊物品标记;二进制表示；低位第一位：前台是否显示 */
    specialFlag?: number
    /** 物品类型ID列表 */
    typeIdList?: number[]
    /** 查询条件下物品总数 */
    count?: number
  }

  interface IconTypeVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 分类名 */
    name?: string
    /** 父级分类ID（-1为根分类） */
    parent?: number
    /** 是否为末端类型 */
    isFinal?: boolean
  }

  interface IconVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 图标名称 */
    name?: string
    /** 图标类型ID列表 */
    typeIdList?: number[]
    /** 图标url */
    url?: string
  }

  interface AreaVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 地区名称 */
    name?: string
    /** 地区代码 */
    code?: string
    /** 地区说明 */
    content?: string
    /** 图标标签 */
    iconTag?: string
    /** 父级地区ID（无父级则为-1） */
    parentId?: number
    /** 是否为末端地区 */
    isFinal?: boolean
    /** 权限屏蔽标记 */
    hiddenFlag?: number
    /** 额外标记;低位第一位：前台是否显示 */
    specialFlag?: number
    /** 排序 */
    sortIndex?: number
  }

  interface SysUserUpdateVo {
    userId?: number
    nickname?: string
    qq?: string
    phone?: string
    logo?: string
    roleId?: number
  }

  interface SysUserPasswordUpdateVo {
    userId?: number
    password?: string
    oldPassword?: string
  }

  interface SysUserRegisterVo {
    username?: string
    password?: string
  }

  interface SysUserSearchVo {
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
    /** 用户名 */
    username?: string
    /** 昵称 */
    nickname?: string
    /** 角色ID */
    roleIds?: string[]
    /** 排序条件 */
    sort?: string[]
  }

  interface PageListVoSysUserVo {
    record?: SysUserVo[]
    total?: number
    size?: number
  }

  interface RPageListVoSysUserVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoSysUserVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface SysUserVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 用户名 */
    username?: string
    /** 昵称 */
    nickname?: string
    /** QQ */
    qq?: string
    /** 手机号 */
    phone?: string
    /** 头像链接 */
    logo?: string
    /** 角色ID */
    roleId?: number
  }

  interface PageAndTypeSearchVo {
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
    /** 父级类型ID列表 */
    typeIdList?: number[]
  }

  interface PageListVoTagTypeVo {
    record?: TagTypeVo[]
    total?: number
    size?: number
  }

  interface RPageListVoTagTypeVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoTagTypeVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface TagVo {
    /** 乐观锁 */
    version?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 标签名 */
    tag?: string
    /** 标签类型ID列表 */
    typeIdList?: number[]
    /** 图标ID */
    iconId?: number
    /** 图标url */
    url?: string
  }

  interface RTagVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: TagVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface TagSearchVo {
    /** 标签名列表 */
    tagList?: string[]
    /**  图标标签分类列表 */
    typeIdList?: number[]
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface PageListVoTagVo {
    record?: TagVo[]
    total?: number
    size?: number
  }

  interface RPageListVoTagVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoTagVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface ScoreParamsVo {
    /** 统计范围 */
    scope?: string
    /** 开始时间 */
    startTime?: string
    /** 结束时间 */
    endTime?: string
    /** 统计颗粒度 */
    span?: 'DAY'
    generatorId?: number
  }

  interface RObject {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: unknown
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RouteSearchVo {
    /** 路线名称模糊搜索字段 */
    namePart?: string
    /** 创建人昵称模糊搜索字段，此字段不能与创建人id字段共存 */
    creatorNicknamePart?: string
    /** 创建人id，此字段不能与昵称模糊搜索字段共存 */
    creatorId?: string
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface PageListVoRouteVo {
    record?: RouteVo[]
    total?: number
    size?: number
  }

  interface RPageListVoRouteVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoRouteVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PageSearchVo {
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface RListRouteVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: RouteVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PageListVoMarkerPunctuateVo {
    record?: MarkerPunctuateVo[]
    total?: number
    size?: number
  }

  interface RPageListVoMarkerPunctuateVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoMarkerPunctuateVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PunctuateSearchVo {
    /** 乐观锁：修改次数 */
    version?: number
    /** 地区ID列表 */
    areaIdList?: number[]
    /** 物品ID列表 */
    itemIdList?: number[]
    /** 类型ID列表 */
    typeIdList?: number[]
    /** 提交者ID列表 */
    authorList?: number[]
  }

  interface RListMarkerPunctuateVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: MarkerPunctuateVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface NoticeSearchVo {
    /** 频道 */
    channels?: string[]
    /** 标题 */
    title?: string
    /** 获取有效数据 */
    getValid?: boolean
    /** 数据转换器 */
    transformer?: string
    /** 排序条件 */
    sort?: string[]
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface PageListVoNoticeVo {
    record?: NoticeVo[]
    total?: number
    size?: number
  }

  interface RPageListVoNoticeVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoNoticeVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface MarkerLinkageVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 组ID */
    groupId?: string
    /** 起始点点位ID;会根据是否反向与 to_id 交换 */
    fromId?: number
    /** 终止点点位ID;会根据是否反向与 from_id 交换 */
    toId?: number
    /** 关联操作类型 */
    linkAction?: string
    /** 是否反向 */
    linkReverse?: boolean
    /** 路线 */
    path?: PathEdgeVo[]
    /** 额外数据 */
    extra?: Record<string, unknown>
  }

  interface PathEdgeVo {
    /** 起始点位ID 输出时会转换为 X1 & Y1 */
    id1?: number
    /** 起始位置X坐标 */
    x1?: number
    /** 起始位置Y坐标 */
    y1?: number
    /** 起始曲线句柄X坐标 起始位置的三次贝塞尔曲线句柄X坐标 */
    handleX1?: number
    /** 起始曲线句柄Y坐标 起始位置的三次贝塞尔曲线句柄Y坐标 */
    handleY1?: number
    /** 起点箭头形状 */
    arrowType1?: 'NONE' | 'ARROW' | 'CIRCLE' | 'DOT'
    /** 终止点位ID 输出时会转换为 X2 & Y2 */
    id2?: number
    /** 终止位置X坐标 */
    x2?: number
    /** 终止位置Y坐标 */
    y2?: number
    /** 终止曲线句柄X坐标 终止位置的三次贝塞尔曲线句柄X坐标 */
    handleX2?: number
    /** 终止曲线句柄Y坐标 终止位置的三次贝塞尔曲线句柄Y坐标 */
    handleY2?: number
    /** 终点箭头形状 */
    arrowType2?: 'NONE' | 'ARROW' | 'CIRCLE' | 'DOT'
    /** 线条样式 */
    lineType?: 'SOLID' | 'DASHED' | 'DOTTED'
  }

  interface RString {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: string
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface MarkerLinkageSearchVo {
    groupIds?: string[]
  }

  interface RMapStringListMarkerLinkageVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: Record<string, MarkerLinkageVo[]>
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface GraphVo {
    /** 点位关联关系 */
    relations?: Record<string, string[]>
    /** 点位关联关系引用映射 */
    relRefs?: Record<string, RelationVo>
    /** 路线组引用映射 */
    pathRefs?: Record<string, PathEdgeVo[]>
  }

  interface LinkRefVo {
    /** 点位ID */
    markerId?: number
    /** 路线组引用ID */
    pathRefId?: number
  }

  interface RMapStringGraphVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: Record<string, GraphVo>
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RelationVo {
    /** 关联组类型 */
    type?: string
    /** 触发关联数据 */
    triggers?: LinkRefVo[]
    /** 目标关联数据 */
    targets?: LinkRefVo[]
    /** 分组关联数据 */
    group?: LinkRefVo[]
  }

  interface TweakConfigMetaVo {
    /** 数据值 */
    value?: unknown
    /** 检查文本 */
    test?: string
    /** 替换为 */
    replace?: string
    /** 键值对映射 */
    map?: Record<string, unknown>
    /** 物品关联 */
    itemList?: MarkerItemLinkVo[]
  }

  interface TweakConfigVo {
    /** 需调整的点位属性 */
    prop?: string
    /** 调整方法类型 */
    type?: string
    meta?: TweakConfigMetaVo
  }

  interface TweakVo {
    /** 点位ID */
    markerIds?: number[]
    /** 点位数据调整配置 */
    tweaks?: TweakConfigVo[]
  }

  interface RListMarkerVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: MarkerVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PageListVoMarkerVo {
    record?: MarkerVo[]
    total?: number
    size?: number
  }

  interface RPageListVoMarkerVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoMarkerVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface MarkerSearchVo {
    /** 地区ID列表 */
    areaIdList?: number[]
    /** 物品ID列表 */
    itemIdList?: number[]
    /** 类型ID列表 */
    typeIdList?: number[]
  }

  interface RListItemTypeVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: ItemTypeVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PageListVoItemTypeVo {
    record?: ItemTypeVo[]
    total?: number
    size?: number
  }

  interface RPageListVoItemTypeVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoItemTypeVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface ItemAreaPublicVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 物品ID */
    itemId?: number
    /** 物品名称 */
    name?: string
    /** 地区ID（须确保是末端地区） */
    areaId?: number
    /** 默认刷新时间;单位:毫秒 */
    defaultRefreshTime?: number
    /** 默认描述模板;用于提交新物品点位时的描述模板 */
    defaultContent?: string
    /** 默认数量 */
    defaultCount?: number
    /** 图标标签 */
    iconTag?: string
    /** 图标样式类型 */
    iconStyleType?: number
    /** 隐藏标志 */
    hiddenFlag?: number
    /** 物品排序 */
    sortIndex?: number
    /** 特殊物品标记;二进制表示；低位第一位：前台是否显示 */
    specialFlag?: number
    /** 物品类型ID列表 */
    typeIdList?: number[]
  }

  interface PageListVoItemAreaPublicVo {
    record?: ItemAreaPublicVo[]
    total?: number
    size?: number
  }

  interface RPageListVoItemAreaPublicVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoItemAreaPublicVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface ItemSearchVo {
    /** 末端物品类型ID列表 */
    typeIdList?: number[]
    /** 末端地区ID列表 */
    areaIdList?: number[]
    /** 物品名 */
    name?: string
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface PageListVoItemVo {
    record?: ItemVo[]
    total?: number
    size?: number
  }

  interface RPageListVoItemVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoItemVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RListItemVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: ItemVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface PageListVoIconTypeVo {
    record?: IconTypeVo[]
    total?: number
    size?: number
  }

  interface RPageListVoIconTypeVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoIconTypeVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RIconVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: IconVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface IconSearchVo {
    /** 乐观锁：修改次数 */
    version?: number
    /** 图标ID列表 */
    iconIdList?: number[]
    /** 创建者ID */
    creator?: number
    /** 图标分类列表 */
    typeIdList?: number[]
    /** 图标名 */
    name?: string
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
  }

  interface PageListVoIconVo {
    record?: IconVo[]
    total?: number
    size?: number
  }

  interface RPageListVoIconVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoIconVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface HistorySearchVo {
    /** 当前页，从0开始 */
    current?: number
    /** 每页大小，默认为10 */
    size?: number
    /** 记录类型 */
    type?: number
    /** 类型ID(配合记录类型使用) */
    id?: number[]
    /** 排序条件 */
    sort?: string[]
  }

  interface HistoryVo {
    /** 乐观锁 */
    version?: number
    /** ID */
    id?: number
    /** 创建人 */
    creatorId?: number
    /** 创建时间 */
    createTime?: string
    /** 更新人 */
    updaterId?: number
    /** 更新时间 */
    updateTime?: string
    /** 内容 */
    content?: string
    /** MD5 */
    md5?: string
    /** 操作数据类型;1地区; 2图标; 3物品; 4点位; 5标签 */
    type?: number
    /** IPv4 */
    ipv4?: string
    /** 修改类型 */
    editType?: 'NONE' | 'CREATE' | 'UPDATE' | 'DELETE'
    tid?: number
  }

  interface PageListVoHistoryVo {
    record?: HistoryVo[]
    total?: number
    size?: number
  }

  interface RPageListVoHistoryVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: PageListVoHistoryVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RAreaVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: AreaVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface AreaSearchVo {
    /** 父级ID */
    parentId?: number
    /** 是否遍历子地区 */
    isTraverse?: boolean
    /** 数据等级(hidden_flag范围) */
    hiddenFlagList?: number[]
  }

  interface RListAreaVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: AreaVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RSysUserVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: SysUserVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RListSysRoleVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: SysRoleVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface SysRoleVo {
    /** 角色ID */
    id?: number
    /** 角色名 */
    name?: string
    /** 角色代码（英文大写） */
    code?: string
    /** 角色层级（越大级别越高） */
    sort?: number
  }

  interface RSysArchiveVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: SysArchiveVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface SysArchiveVo {
    /** 存档时间 */
    time?: string
    /** 存档 */
    archive?: string
    /** 存档历史下标 */
    historyIndex?: number
  }

  interface RSysArchiveSlotVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: SysArchiveSlotVo
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface SysArchiveSlotVo {
    version?: number
    /** 存档ID */
    id?: number
    /** 存档名称 */
    name?: string
    /** 槽位顺序 */
    slotIndex?: number
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    /** 存档列表 */
    archive?: SysArchiveVo[]
  }

  interface RListSysArchiveSlotVo {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: SysArchiveSlotVo[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }

  interface RListString {
    error?: boolean
    errorStatus?: number
    errorData?: unknown
    message?: string
    data?: string[]
    users?: Record<string, SysUserSmallVo>
    time?: string
  }
}
