import { BitmapLayer } from '@deck.gl/layers/typed'
import type { _TileLoadProps } from '@deck.gl/geo-layers/typed'
import { TileLayer } from '@deck.gl/geo-layers/typed'
import type { GSCompositeLayerState } from '.'

export class GSTileLayer extends TileLayer {
  static layerName = 'GenshinTileLayer'

  static config = {
    /** tiles 前缀地址 */
    baseURL: import.meta.env.VITE_ASSETS_BASE,
    /** 地图 zoom 为 0 时对应服务器资源的实际 zoom 值 */
    zoomMapping: 13,
  }

  constructor(state: GSCompositeLayerState) {
    const {
      code,
      extension,
      size: [w, h],
      tilesOffset: [ox, oy],
    } = state.tileConfig!.tile

    super({
      id: `tile-layer-${code}`,
      data: undefined,
      tileSize: 256,
      minZoom: -3, // 固定值，对应服务端存储底图的 level 10
      maxZoom: 0, // 固定值，对应服务端存储底图的 level 13
      extent: [ox, h + oy, w + ox, oy],
      maxCacheSize: Number.MAX_SAFE_INTEGER,
      getTileData: async ({ index: { x, y, z }, signal }: _TileLoadProps) => {
        const { baseURL, zoomMapping } = GSTileLayer.config
        try {
          if (signal?.aborted)
            return null
          const url = `${baseURL}/tiles_${code}/${z + zoomMapping}/${x}_${y}.${extension}`
          const blob = await fetch(url, { mode: 'cors' }).then(res => res.blob())
          const image = await createImageBitmap(blob)
          return {
            byteLength: blob.size,
            image,
          }
        }
        catch {
          return null
        }
      },
      renderSubLayers: (props) => {
        const [[xmin, ymin], [xmax, ymax]] = props.tile.boundingBox
        return new BitmapLayer(props, {
          data: undefined, // 通过 getTileData 函数获取图片，不需要 data 字段，必须明确指定为空
          image: props.data.image,
          bounds: [xmin, ymax, xmax, ymin],
        })
      },
    })
  }
}
