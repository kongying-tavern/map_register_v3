export enum MapNameEnum {
  /** 提瓦特 */
  TIVAT_MASTER = '提瓦特',
  /** 金苹果群岛 */
  GOLDEN_APPLE_ISLANDS = '金苹果群岛',
  /** 层岩巨渊 */
  CENG_YAN_JU_YUAN = '层岩巨渊（地下矿区）',
  /** 渊下宫 */
  YUAN_XIA_GONG = '渊下宫',
  /** 三界路飨祭 */
  SAN_JIE_LU_XIANG_JI = '三界路飨祭',
  /** 非地图，仅用于继承 */
  EXTEND_0 = 'extend_0',
}

/** 地图标签配置 */
export interface TagOptions {
  /** 渲染内容 */
  html: string
  /** 坐标表达式 */
  latlng: [number, number]
  /** 显示的最大缩放倍率 */
  zoomMax?: number
  /** 显示的最小缩放倍率 */
  zoomMin?: number
  /** 字体尺寸 */
  fontSize?: number
}

export interface MapTileConfig {
  /** 标号 */
  code?: string
  /** 中心点坐标 */
  center?: [x: number, y: number]
  /** 偏移量 */
  tilesOffset?: [x: number, y: number]
  /** 尺寸 */
  size?: [w: number, h: number]
  /** 其他地图设置 */
  settings?: L.MapOptions
  /** 图片后缀名 */
  extension?: string
  /** 当前地图包含的地区 code */
  areaCodes: string[]
  /** 继承配置 */
  extend?: MapNameEnum
  /** 标注 */
  tags?: TagOptions[]
}

/** 地图切片配置 */
export const mapTiles: Record<MapNameEnum, MapTileConfig> = {
  [MapNameEnum.EXTEND_0]: {
    areaCodes: [],
    extension: 'png',
    center: [3568, 6286],
    size: [12288, 12288],
    tilesOffset: [0, 0],
    settings: {
      center: [0, 0],
      zoom: -4,
    },
  },
  [MapNameEnum.TIVAT_MASTER]: {
    extend: MapNameEnum.EXTEND_0,
    areaCodes: [
      'C:LY',
      'A:LY:LIYUE',
      'A:LY:CENGYAN',
      'C:MD',
      'A:MD:MENGDE',
      'C:DQ',
      'A:DQ:1',
      'A:DQ:2',
      'A:DQ:HEGUAN',
      'A:MD:XUESHAN',
      'C:XM',
      'A:XM:FOREST',
      'A:XM:DESERT',
      'A:XM:DESERT2',
      'A:XM:DESERT3',
    ],
    code: 'twt36',
    size: [17408, 16384],
    tilesOffset: [-5800, 0],
    settings: {
      center: [0, 0],
      // 初始缩放比率较低时会有奇怪的 bug
      zoom: -2,
    },
    tags: [
      // 蒙德
      { html: '明冠山地', latlng: [917, -4337], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '苍风高地', latlng: [1260, -3553], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '坠星山谷', latlng: [2295, -4122], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '坠星山谷', latlng: [2295, -4122], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '风啸山坡', latlng: [2323, -2880], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '风龙废墟', latlng: [344, -4530] },
      { html: '明冠峡', latlng: [1096, -4498] },
      { html: '果酒湖', latlng: [1624, -4378] },
      { html: '望风山地', latlng: [2252, -4542] },
      { html: '望风角', latlng: [2872, -4726] },
      { html: '星落湖', latlng: [2304, -4294] },
      { html: '摘星崖', latlng: [2840, -4234] },
      { html: '千风神殿', latlng: [2808, -3894] },
      { html: '蒙德城', latlng: [1600, -4050] },
      { html: '低语森林', latlng: [2040, -4074] },
      { html: '奔狼领', latlng: [1080, -3678] },
      { html: '清泉镇', latlng: [1644, -3354] },
      { html: '风起地', latlng: [2172, -3470] },
      { html: '晨曦酒庄', latlng: [1100, -3200] },
      { html: '鹰翔海滩', latlng: [2860, -3182] },
      { html: '达达乌帕谷', latlng: [2616, -2650] },
      { html: '誓言岬', latlng: [3268, -2818] },
      { html: '马斯克礁', latlng: [4012, -2882] },
      // 雪山
      { html: '龙脊雪山', latlng: [1506, -2470], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '覆雪之路', latlng: [1896, -2674] },
      { html: '眠龙谷', latlng: [1456, -2562] },
      { html: '雪葬之都 · 近郊', latlng: [1200, -2200] },
      { html: '雪葬之都 · 旧宫', latlng: [1900, -2300] },
      { html: '寒天之钉', latlng: [1748, -2120] },
      { html: '星荧洞窟', latlng: [1588, -1950] },
      // 璃月
      { html: '层岩巨渊', latlng: [-1851, 128], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '珉林', latlng: [-1500, -1429], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '璃沙郊', latlng: [-864, 18], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '云来海', latlng: [736, -199], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '琼玑野', latlng: [482, -1531], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '碧水原', latlng: [-205, -2507], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '轻策庄', latlng: [-376, -3162] },
      { html: '无妄坡', latlng: [0, -2920] },
      { html: '石门', latlng: [240, -2778] },
      { html: '池中之盐', latlng: [680, -2494] },
      { html: '荻花洲', latlng: [50, -2386] },
      { html: '望舒客栈', latlng: [64, -1950] },
      { html: '明蕴镇', latlng: [876, -1854] },
      { html: '瑶光滩', latlng: [748, -1402] },
      { html: '归离原', latlng: [148, -1526] },
      { html: '孤云阁', latlng: [1452, -514] },
      { html: '翠玦坡', latlng: [-556, -1386] },
      { html: '渌华池', latlng: [-292, -1042] },
      { html: '遁玉陵', latlng: [-716, -518] },
      { html: '灵矩关', latlng: [-1020, -154] },
      { html: '天衡山', latlng: [-292, -158] },
      { html: '璃月港', latlng: [204, -198] },
      { html: '青墟浦', latlng: [-1220, 386] },
      { html: '奥藏山', latlng: [-1580, -2334] },
      { html: '华光林', latlng: [-1804, -2046] },
      { html: '庆云顶', latlng: [-1536, -1910] },
      { html: '绝云间', latlng: [-1080, -1754] },
      { html: '琥牢山', latlng: [-1964, -1754] },
      { html: '南天门', latlng: [-1760, -1362] },
      { html: '天遒谷', latlng: [-1130, -1026] },
      { html: '采樵谷', latlng: [-1608, -470] },
      { html: '伏鳌谷', latlng: [-1908, -134] },
      { html: '地面矿区', latlng: [-1896, 6] },
      { html: '巨渊之口', latlng: [-1950, 150] },
      { html: '丹砂崖', latlng: [-2244, 298] },
      { html: '天工峡', latlng: [-1960, 414] },
      { html: '琉璃峰', latlng: [-1500, 390] },
      // 稻妻
      { html: '刃连岛', latlng: [6116, 1646] },
      { html: '荒海', latlng: [6220, 2210] },
      { html: '离岛', latlng: [5588, 2506] },
      { html: '鸣神大社 · 神樱', latlng: [6450, 2454] },
      { html: '影向山', latlng: [6336, 2602] },
      { html: '神里屋敷', latlng: [6668, 2590] },
      { html: '绀田村', latlng: [5990, 2750] },
      { html: '镇守之森', latlng: [6456, 2858] },
      { html: '白狐之野', latlng: [6150, 3000] },
      { html: '甘金岛', latlng: [5820, 3130] },
      { html: '稻妻城', latlng: [6588, 3418] },
      { html: '九条阵屋', latlng: [5120, 3540] },
      { html: '踏鞴砂', latlng: [4650, 4178] },
      { html: '名椎滩', latlng: [4100, 3870] },
      { html: '藤兜砦', latlng: [3328, 4006] },
      { html: '无明砦', latlng: [2840, 4110] },
      { html: '无想刃狭间', latlng: [3608, 4054] },
      { html: '绯木村', latlng: [3384, 4200] },
      { html: '蛇神之首', latlng: [3520, 4362] },
      { html: '蛇骨矿洞', latlng: [3600, 4622] },
      { html: '水月池', latlng: [1960, 3942] },
      { html: '曚云神社', latlng: [1176, 4278] },
      { html: '珊瑚宫', latlng: [1544, 4222] },
      { html: '望泷村', latlng: [1648, 4470] },
      { html: '平海砦', latlng: [6372, 4858] },
      { html: '越石村', latlng: [5796, 5018] },
      { html: '「清籁丸」', latlng: [5500, 5050] },
      { html: '浅濑神社', latlng: [5400, 5542] },
      { html: '天云峠', latlng: [6200, 5450] },
      { html: '知比山', latlng: [3930, 7150] },
      { html: '笈名海滨', latlng: [4036, 7334] },
      { html: '千来神祠', latlng: [4376, 7286] },
      { html: '逢岳之野', latlng: [3900, 7580] },
      { html: '菅名山', latlng: [4100, 7600] },
      { html: '茂知祭场', latlng: [4230, 7674] },
      { html: '惑饲滩', latlng: [4192, 7854] },
      // 须弥（草原）
      { html: '善见地', latlng: [-3850, 901], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '桓那兰那', latlng: [-4125, -581], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '二净甸', latlng: [-3811, -221], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '阿陀河谷', latlng: [-2897, 1305], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '道成林', latlng: [-2965, 41], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '护世森', latlng: [-2657, -1112], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '无郁稠林', latlng: [-2500, -1228] },
      { html: '卡萨扎莱宫', latlng: [-2980, -930] },
      { html: '茸蕈窟', latlng: [-3250, -800] },
      { html: '桓那兰那', latlng: [-4086, -576] },
      { html: '须弥城', latlng: [-3154, -320] },
      { html: '香醉坡', latlng: [-2540, -280] },
      { html: '离渡谷', latlng: [-2850, -64] },
      { html: '天臂池', latlng: [-3300, -14] },
      { html: '化城郭', latlng: [-2748, 260] },
      { html: '维摩庄', latlng: [-3030, 642] },
      { html: '禅那园', latlng: [-3700, 620] },
      { html: '谒颂幽境', latlng: [-4300, 680] },
      { html: '降诸魔山', latlng: [-2660, 1050] },
      { html: '水天丛林', latlng: [-3850, 1304] },
      { html: '奥摩斯港', latlng: [-2850, 1770] },
      { html: '荼诃之座', latlng: [-4400, 1560] },
      { html: '觉王之殿', latlng: [-4280, 14] },
      { html: '往昔的桓那兰那', latlng: [-4700, 80] },
      // 须弥（沙漠）
      { html: '千壑沙地', latlng: [-6489, 97], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '列柱沙原', latlng: [-6826, 2371], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '上风蚀地', latlng: [-5539, 3234], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '下风蚀地', latlng: [-5282, 1557], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '失落的苗圃', latlng: [-4656, 66], zoomMax: -1.5, zoomMin: -2.5, fontSize: 36 },
      { html: '「五绿洲」的孑遗', latlng: [-5600, -546] },
      { html: '「三运河之地」', latlng: [-6600, -200] },
      { html: '镔铁沙丘', latlng: [-5200, 0] },
      { html: '愚妄行宫', latlng: [-5800, 154] },
      { html: '折胫谷', latlng: [-7230, 16] },
      { html: '达马山', latlng: [-6590, 281] },
      { html: '啁哳之沙', latlng: [-5450, 326] },
      { html: '亡者狭廊', latlng: [-5900, 626] },
      { html: '巨人峡谷', latlng: [-6550, 870] },
      { html: '「神的棋盘」', latlng: [-6950, 1100] },
      { html: '塔尼特露营地', latlng: [-6200, 1150] },
      { html: '圣显厅', latlng: [-5350, 1180] },
      { html: '喀万驿', latlng: [-4632, 1324] },
      { html: '饱饮之丘', latlng: [-6568, 1734] },
      { html: '阿如村', latlng: [-5046, 1816] },
      { html: '舍身陷坑', latlng: [-5500, 1986] },
      { html: '活力之家', latlng: [-4760, 2200] },
      { html: '赤王陵', latlng: [-6848, 2306] },
      { html: '丰饶绿洲', latlng: [-5860, 2500] },
      { html: '避让之丘', latlng: [-6420, 2992] },
      { html: '铄石之丘', latlng: [-7190, 2970] },
      { html: '荼诃落谷', latlng: [-5350, 3250] },
      { html: '秘仪圣殿', latlng: [-6100, 2314] },
    ],
  },
  [MapNameEnum.GOLDEN_APPLE_ISLANDS]: {
    extend: MapNameEnum.EXTEND_0,
    areaCodes: [
      'C:APPLE',
      'A:APPLE:1_6_STG2',
      'A:APPLE:1_6_STG1',
      'A:APPLE:2_8',
    ],
    code: 'qd28',
    size: [8192, 8192],
    settings: {
      center: [488, -2235],
      zoom: -1,
    },
  },
  [MapNameEnum.CENG_YAN_JU_YUAN]: {
    extend: MapNameEnum.EXTEND_0,
    areaCodes: ['A:LY:CENGYAN_UG'],
    code: 'cyjy',
    settings: {
      center: [1800, -500],
      zoom: -3,
    },
  },
  [MapNameEnum.YUAN_XIA_GONG]: {
    extend: MapNameEnum.EXTEND_0,
    areaCodes: ['A:DQ:YUANXIAGONG'],
    code: 'yxg',
  },
  [MapNameEnum.SAN_JIE_LU_XIANG_JI]: {
    extend: MapNameEnum.EXTEND_0,
    areaCodes: ['A:DQ:SANJIE'],
    code: 'yxg2',
  },
}
