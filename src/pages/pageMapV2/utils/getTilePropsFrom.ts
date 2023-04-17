import { BitmapLayer } from '@deck.gl/layers/typed'
import type { NonGeoBoundingBox, TileLayerProps } from '@deck.gl/geo-layers/typed'
import type { GenshinBaseLayer } from '../core'

export const getTilePropsFrom = (target: GenshinBaseLayer): TileLayerProps => ({
  id: `${target.props.id}-tile`,
  coordinateSystem: target.rawProps.coordinateSystem,
  coordinateOrigin: target.rawProps.coordinateOrigin,
  data: null,
  tileSize: 256,
  minZoom: -3, // 固定值，对应服务端存储底图的 level 10
  maxZoom: 0, // 固定值，对应服务端存储底图的 level 13
  maxRequests: 1,
  extent: target.rawProps.bounds,
  getTileData: ({ index: { x, y, z }, signal }) => {
    if (signal?.aborted)
      return null
    const url = `${import.meta.env.VITE_ASSETS_BASE}/tiles_${target.rawProps.code}/${z + 13}/${x}_${y}.${target.rawProps.extension}`
    return fetch(url, { mode: 'cors' }).then(res => res.blob()).then(blob => createImageBitmap(blob))
  },
  renderSubLayers: (subProps) => {
    const { left, bottom, right, top } = subProps.tile.bbox as NonGeoBoundingBox
    return new BitmapLayer(subProps, {
      // 通过自定义 getTileData 函数获取图片，不需要 data 字段，必须明确指定为空
      data: undefined,
      image: subProps.data,
      bounds: [left, bottom, right, top],
    })
  },
})
