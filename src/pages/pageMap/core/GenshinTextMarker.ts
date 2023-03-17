import L from 'leaflet'

export interface TextMarkerOptions {
  /** 需要被渲染的 html 内容 */
  html?: string
  /** 字体尺寸，将会基于 汉仪魏文85W 字体计算 iconMarker 的尺寸 */
  fontSize?: number
  /** 开始显示的最小缩放等级，当地图缩放小于该值时，当前标记将会被隐藏 */
  zoomMin?: number
  /** 开始隐藏的最小缩放等级，当地图缩放大于该值时，当前标记将会被隐藏 */
  zoomMax?: number
}

export class GenshinTextMarker extends L.Marker {
  private visibleIcon: L.DivIcon
  private hiddenIcon: L.DivIcon
  private visible: boolean

  constructor(latlng: L.LatLngExpression, options: TextMarkerOptions = {}) {
    const { html = '', zoomMax = 2, zoomMin = -1, fontSize = 16 } = options
    super(latlng, {
      interactive: false, // 取消交互
      pane: 'shadowPane',
    })
    this.visibleIcon = L.divIcon({
      html: `<div class="genshin-text-marker w-full h-full" style="font-size: ${fontSize}px;">${html}</div>`,
      className: 'genshin-text genshin-text-stroke text-white leading-none',
      // 考虑到性能问题，这里就不根据地图缩放来动态修改尺寸了
      iconSize: [html.length * fontSize, fontSize],
    })
    // 处于减少 bug 的考虑，这里不使用从地图移除图层来隐藏，而是通过 css 动画（）来隐藏，以避免添加/移除点位时的影响
    this.hiddenIcon = L.divIcon({
      html: `<div class="genshin-text-marker visible-fade w-full h-full" style="font-size: ${fontSize}px;">${html}</div>`,
      className: 'genshin-text genshin-text-stroke text-white leading-none',
      iconSize: [html.length * fontSize, fontSize],
    })
    this.setIcon(this.hiddenIcon)
    this.visible = false

    // 当缩放不满足设置需求时，通过使用隐藏 icon 来隐藏 marker
    this.on('zoom', (ev) => {
      const { zoom: currentZoom } = ev as L.LeafletEvent & { zoom: number; fontSize: number }
      if (zoomMin >= zoomMax || currentZoom < zoomMin || currentZoom > zoomMax) {
        this.visible && this.setIcon(this.hiddenIcon)
        this.visible = false
        return
      }
      !this.visible && this.setIcon(this.visibleIcon)
      this.visible = true
    })
  }
}
