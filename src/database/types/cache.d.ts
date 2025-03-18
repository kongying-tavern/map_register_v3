type CovertMapToSchemas<T> = {
  [K in keyof T]: {
    id: K
    value: T[K]
    digest: string
  }
}[keyof T]

declare namespace DBType {
  /** 图标的精灵图信息缓存 */
  interface TagSprite {
    image: ArrayBuffer
    tagsPositionList: {
      tags: string[]
      pos: [x: number, y: number]
    }[]
  }

  /** 点位的精灵图信息缓存 */
  interface MarkerSprite {
    image: ArrayBuffer
    tagSpriteDigest: string
    mapping: Record<string, {
      x: number
      y: number
      width: number
      height: number
      anchorX?: number
      anchorY?: number
    }>
  }

  /** 实体缓存类型表 */
  interface CacheTypes {
    tagSprite: TagSprite
    markerSprite: MarkerSprite
    dadian: API.DadianJSON
  }

  /** 实体缓存 */
  type InstancedCache = CovertMapToSchemas<CacheTypes>
}
