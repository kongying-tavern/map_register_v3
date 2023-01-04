
declare namespace API {
  type TagTypeVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 分类ID */
    id?: number;
    /** 分类名 */
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
    time?: string;
  };

  type RBoolean = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: boolean;
    time?: string;
  };

  type Routeqianduanfengzhuang = {
    /** 乐观锁：修改次数 */
    version?: number;
    路线ID?: number;
    路线名称?: string;
    路线描述?: string;
    点位顺序数组?: string;
    显隐等级?: number;
    视频地址?: string;
    额外信息?: string;
    /** 创建人 */
    creatorId?: number;
    创建人昵称?: string;
  };

  type MarkerItemLinkVo = {
    /** 物品id */
    itemId?: number;
    /** 点位物品数量 */
    count?: number;
    /** 图标标签 */
    iconTag?: string;
  };

  type MarkerPunctuateVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 打点ID */
    punctuateId?: number;
    /** 原有点位id */
    originalMarkerId?: number;
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
    /** 额外特殊字段 */
    extra?: string;
    /** 点位提交者id */
    author?: number;
    /** 状态;0:暂存 1:审核中 2:不通过 */
    status?: number;
    /** 审核备注 */
    auditRemark?: string;
    /** 操作类型;1: 新增 2: 修改 3: 删除 */
    methodType?: number;
    /** 刷新时间 */
    refreshTime?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
  };

  type MarkerVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 点位ID */
    id?: number;
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
    /** 额外特殊字段 */
    extra?: string;
    /** 刷新时间 */
    refreshTime?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
  };

  type ItemTypeVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 类型ID */
    typeId?: number;
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
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 物品类型排序 */
    sortIndex?: number;
  };

  type RListLong = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: number[];
    time?: string;
  };

  type ItemVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 物品ID */
    itemId?: number;
    /** 物品名称 */
    name?: string;
    /** 物品类型ID列表 */
    typeIdList?: number[];
    /** 地区ID（须确保是末端地区） */
    areaId?: number;
    /** 默认描述模板;用于提交新物品点位时的描述模板 */
    defaultContent?: string;
    /** 图标标签 */
    iconTag?: string;
    /** 图标样式类型 */
    iconStyleType?: number;
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 刷新时间(单位:毫秒) */
    defaultRefreshTime?: number;
    /** 物品排序 */
    sortIndex?: number;
    /** 默认物品数量 */
    defaultCount?: number;
    /** 特殊物品标记，二进制表示<br>低位第一位：是否为显示物品 */
    specialFlag?: number;
    /** 查询条件下物品总数 */
    count?: number;
  };

  type IconTypeVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 分类ID */
    id?: number;
    /** 分类名 */
    name?: string;
    /** 父级分类ID（-1为根分类） */
    parent?: number;
    /** 是否为末端类型 */
    isFinal?: boolean;
  };

  type IconVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 图标ID */
    iconId?: number;
    /** 图标名称 */
    name?: string;
    /** 图标类型ID列表 */
    typeIdList?: number[];
    /** 图标url */
    url?: string;
    /** 创建者ID */
    creator?: number;
  };

  type AreaVo = {
    /** 乐观锁：修改次数 */
    version?: number;
    /** 地区ID */
    areaId?: number;
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
    /** 隐藏标志 */
    hiddenFlag?: number;
    /** 地区排序 */
    sortIndex?: number;
  };

  type PageAndTypeListVo = {
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
    time?: string;
  };

  type TagVo = {
    /** 乐观锁：修改次数 */
    version?: number;
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
    time?: string;
  };

  type luxianfenyechaxunqianduanfengzhuang = {
    '路线名称模糊搜索字段'?: string;
    '创建人昵称模糊搜索字段，此字段不能与创建人id字段共存'?: string;
    '创建人id，此字段不能与昵称模糊搜索字段共存'?: string;
    /** 当前页，从0开始 */
    'current'?: number;
    /** 每页大小，默认为10 */
    'size'?: number;
  };

  type PageListVoRouteqianduanfengzhuang = {
    record?: Routeqianduanfengzhuang[];
    total?: number;
    size?: number;
  };

  type RPageListVoRouteqianduanfengzhuang = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: PageListVoRouteqianduanfengzhuang;
    time?: string;
  };

  type PageSearchVo = {
    /** 当前页，从0开始 */
    current?: number;
    /** 每页大小，默认为10 */
    size?: number;
  };

  type RListRouteqianduanfengzhuang = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: Routeqianduanfengzhuang[];
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
    time?: string;
  };

  type MarkerSearchVo = {
    /** 地区ID列表 */
    areaIdList?: number[];
    /** 物品ID列表 */
    itemIdList?: number[];
    /** 类型ID列表 */
    typeIdList?: number[];
    /** 获取测试点位，默认为false不获取，为true时只获取测试点位 */
    getBeta?: boolean;
    /** 数据等级(hidden_flag范围) */
    hiddenFlagList?: number[];
  };

  type RListMarkerVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: MarkerVo[];
    time?: string;
  };

  type RListItemTypeVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ItemTypeVo[];
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
    time?: string;
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

  type RListItemVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: ItemVo[];
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
    time?: string;
  };

  type RIconVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: IconVo;
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
    id?: number;
    /** 内容 */
    content?: Record<string, any>;
    /** md5 */
    md5?: string;
    /** 记录类型 */
    type?: number;
    /** ipv4 */
    ipv4?: string;
    /** 创建人 */
    creatorId?: number;
    /** 创建时间 */
    createTime?: string;
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
    time?: string;
  };

  type RAreaVo = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: AreaVo;
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
    time?: string;
  };

  type RString = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: string;
    time?: string;
  };

  type RListString = {
    error?: boolean;
    errorStatus?: number;
    errorData?: Record<string, any>;
    message?: string;
    data?: string[];
    time?: string;
  };
}
