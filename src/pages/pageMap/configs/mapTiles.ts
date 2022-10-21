export enum MapNameEnum {
  TIVAT_BASE_0 = '提瓦特-base0',
  TIVAT_BASE_1 = '提瓦特-base1',
  GOLDEN_APPLE_ISLANDS = '金苹果群岛',
  UNDERGROUND_MINIG_AREA = '地下矿区',
  YUAN_XIA_GONG = '渊下宫',
  SANJIE_ROAD_FEAST = '三界路飨祭',
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

export const mapTiles: Record<MapNameEnum, MapTileConfig> = {
  [MapNameEnum.TIVAT_BASE_0]: {
    extension: 'png',
    code: 'twt31',
    settings: {
      center: [0, 1742],
    },
    center: [3568, 6286],
    size: [16384, 15360],
    tilesOffset: [-4864, 0],
  },
  [MapNameEnum.TIVAT_BASE_1]: {
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
  [MapNameEnum.UNDERGROUND_MINIG_AREA]: {
    extend: MapNameEnum.TIVAT_BASE_1,
    code: 'cyjy',
    settings: {
      center: [1800, -500],
      zoom: -3,
    },
  },
  [MapNameEnum.YUAN_XIA_GONG]: {
    extend: MapNameEnum.TIVAT_BASE_1,
    code: 'yxg',
    settings: {
      center: [2000, 300],
      zoom: -4,
    },
  },
  [MapNameEnum.SANJIE_ROAD_FEAST]: {
    extend: MapNameEnum.TIVAT_BASE_1,
    code: 'yxg',
    settings: {
      center: [2000, 300],
      zoom: -4,
    },
  },
}
