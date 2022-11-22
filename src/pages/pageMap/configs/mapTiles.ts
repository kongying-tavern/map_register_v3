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
  /** 当前地图包含的地区 id */
  areaIds: number[]
  /** 继承配置 */
  extend?: MapNameEnum
}

/** 地图切片配置 */
export const mapTiles: Record<MapNameEnum, MapTileConfig> = {
  [MapNameEnum.EXTEND_0]: {
    areaIds: [],
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
    areaIds: [1, 2, 3, 5, 6, 11, 12, 13, 14, 17, 18, 19, 21],
    code: 'twt31',
    size: [16384, 15360],
    tilesOffset: [-4864, 0],
    settings: {
      center: [0, 1742],
      // 初始缩放比率较低时会有奇怪的 bug
      zoom: -2,
    },
  },
  [MapNameEnum.GOLDEN_APPLE_ISLANDS]: {
    extend: MapNameEnum.EXTEND_0,
    areaIds: [7, 8, 9, 10],
    code: 'qd28',
    size: [8192, 8192],
    settings: {
      center: [600, -3000],
      zoom: -2,
    },
  },
  [MapNameEnum.CENG_YAN_JU_YUAN]: {
    extend: MapNameEnum.EXTEND_0,
    areaIds: [4],
    code: 'cyjy',
    settings: {
      center: [1800, -500],
      zoom: -3,
    },
  },
  [MapNameEnum.YUAN_XIA_GONG]: {
    extend: MapNameEnum.EXTEND_0,
    areaIds: [15],
    code: 'yxg',
  },
  [MapNameEnum.SAN_JIE_LU_XIANG_JI]: {
    extend: MapNameEnum.EXTEND_0,
    areaIds: [16],
    code: 'yxg2',
  },
}
