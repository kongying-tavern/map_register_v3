import L from 'leaflet'

/** 啥也不动，就做个类型补丁 */
export class GenshinRenderer extends L.Canvas {
  declare _ctx?: CanvasRenderingContext2D
  declare _drawing: boolean

  constructor(options: L.RendererOptions = {}) {
    super(options)
  }
}
