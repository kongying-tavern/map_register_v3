export enum MapNameEnum {
  /** 提瓦特 */
  TIVAT_MASTER = '提瓦特',
  /** 金苹果群岛 */
  GOLDEN_APPLE_ISLANDS = '金苹果群岛',
  /** 层岩巨渊 */
  CENG_YAN_JU_YUAN = '层岩巨渊',
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
  /** 其他设置 */
  settings?: L.MapOptions
  /** 图片后缀名 */
  extension?: string
  /** 继承配置 */
  extend?: MapNameEnum
}

/** 地图切片配置 */
export const mapTiles: Record<MapNameEnum, MapTileConfig> = {
  [MapNameEnum.EXTEND_0]: {
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
    code: 'twt31',
    size: [16384, 15360],
    tilesOffset: [-4864, 0],
    settings: {
      center: [0, 1742],
    },
  },
  [MapNameEnum.GOLDEN_APPLE_ISLANDS]: {
    extend: MapNameEnum.EXTEND_0,
    code: 'qd28',
    size: [8192, 8192],
    settings: {
      center: [600, -3000],
      zoom: -2,
    },
  },
  [MapNameEnum.CENG_YAN_JU_YUAN]: {
    extend: MapNameEnum.EXTEND_0,
    code: 'cyjy',
    settings: {
      center: [1800, -500],
      zoom: -3,
    },
  },
  [MapNameEnum.YUAN_XIA_GONG]: {
    extend: MapNameEnum.EXTEND_0,
    code: 'yxg',
  },
  [MapNameEnum.SAN_JIE_LU_XIANG_JI]: {
    extend: MapNameEnum.EXTEND_0,
    code: 'yxg2',
  },
}

export const tileOptions = Object
  .entries(mapTiles)
  .reduce((seed, [key, mapTileConfig]) => {
    mapTileConfig.code && seed.push(key as MapNameEnum)
    return seed
  }, [] as MapNameEnum[])
