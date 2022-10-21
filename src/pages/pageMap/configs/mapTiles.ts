export enum MapNameEnum {
  /** 提瓦特 */
  TIVAT_MASTER = '提瓦特',
  /** 非地图，仅用于继承 */
  TIVAT_EXTEND_BASE = 'base',
  /** 金苹果群岛 */
  GOLDEN_APPLE_ISLANDS = '金苹果群岛',
  /** 层岩巨渊 */
  CENG_YAN_JU_YUAN = '层岩巨渊',
  /** 渊下宫 */
  YUAN_XIA_GONG = '渊下宫',
  /** 三界路飨祭 */
  SAN_JIE_LU_XIANG_JI = '三界路飨祭',
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
  /** 其他设置 */
  settings?: L.MapOptions
  /** 图片后缀名 */
  extension?: string
  /** 继承配置 */
  extend?: MapNameEnum
}

/** 地图切片配置 */
export const mapTiles: Record<MapNameEnum, MapTileConfig> = {
  [MapNameEnum.TIVAT_MASTER]: {
    extension: 'png',
    code: 'twt31',
    settings: {
      center: [0, 1742],
    },
    center: [3568, 6286],
    size: [16384, 15360],
    tilesOffset: [-4864, 0],
  },
  [MapNameEnum.TIVAT_EXTEND_BASE]: {
    extension: 'png',
    center: [3568, 6286],
    size: [12288, 15360],
  },
  [MapNameEnum.GOLDEN_APPLE_ISLANDS]: {
    extension: 'png',
    code: 'qd28',
    settings: {
      center: [600, -2190],
      zoom: -2,
    },
    center: [3568, 6286],
    size: [8192, 8192],
  },
  [MapNameEnum.CENG_YAN_JU_YUAN]: {
    extend: MapNameEnum.TIVAT_EXTEND_BASE,
    code: 'cyjy',
    settings: {
      center: [1800, -500],
      zoom: -3,
    },
  },
  [MapNameEnum.YUAN_XIA_GONG]: {
    extend: MapNameEnum.TIVAT_EXTEND_BASE,
    code: 'yxg',
    size: [12288, 12288],
    tilesOffset: [0, 0],
    settings: {
      center: [3568, 600],
      zoom: -4,
    },
  },
  [MapNameEnum.SAN_JIE_LU_XIANG_JI]: {
    extend: MapNameEnum.TIVAT_EXTEND_BASE,
    code: 'yxg2',
    size: [12288, 12288],
    tilesOffset: [0, 0],
    settings: {
      center: [3568, 600],
      zoom: -4,
    },
  },
}
