import { IconLayer, LineLayer } from '@deck.gl/layers'
import { CompositeLayer } from '@deck.gl/core'
import type { Layer, UpdateParameters } from '@deck.gl/core'
import type { GSMarkerInfo } from '@/packages/map'

export class LinkerIndicatorLayer extends CompositeLayer<{
  from: GSMarkerInfo
  to: GSMarkerInfo
  color: [r: number, g: number, b: number]
}> {
  static layerName = 'GSMarkerLinkIndicator'

  static iconAtlas = (async () => {
    const { promise, resolve } = Promise.withResolvers<HTMLImageElement>()
    const img = new Image(64, 64)
    img.src = '/icons/deck-arrow.png'
    img.onload = () => resolve(img)
    return promise
  })()

  shouldUpdateState(params: UpdateParameters<Layer>): boolean {
    const { propsOrDataChanged, viewportChanged } = params.changeFlags
    return propsOrDataChanged || viewportChanged
  }

  generateEqualDistancePoints = (xa: number, ya: number, xb: number, yb: number, splitLength: number, zoom = 0): [number, number][] => {
    const distance = (((xb - xa) ** 2 + (yb - ya) ** 2) ** 0.5) * (2 ** zoom)

    if (distance <= splitLength) {
      const midpoint = [(xa + xb) / 2, (ya + yb) / 2] as [number, number]
      return [midpoint]
    }

    const points: [number, number][] = []
    const numPoints = Math.ceil(distance / splitLength)
    const deltaX = (xb - xa) / numPoints
    const deltaY = (yb - ya) / numPoints

    for (let i = 1; i < numPoints; i++) {
      const x = xa + i * deltaX
      const y = ya + i * deltaY
      points.push([x, y])
    }

    return points
  }

  renderLayers = () => {
    const { zoom } = this.context.viewport
    const [xa, ya] = this.props.from.render.position
    const [xb, yb] = this.props.to.render.position
    const [r, g, b] = this.props.color
    const angle = 270 - Math.atan2(yb - ya, xb - xa) * (180 / Math.PI)
    const points = this.generateEqualDistancePoints(xa, ya, xb, yb, 40, zoom)
    return [
      new LineLayer<{ from: GSMarkerInfo; to: GSMarkerInfo }>({
        id: 'marker-link-hover-line',
        data: [{ from: this.props.from, to: this.props.to }],
        getSourcePosition: ({ from }) => from.render.position,
        getTargetPosition: ({ to }) => to.render.position,
        getColor: [r, g, b, 128],
        getWidth: 2,
        widthMinPixels: 2,
        updateTriggers: {
          getSourcePosition: this.props.from,
          getTargetPosition: this.props.to,
        },
      }),
      new IconLayer<[x: number, y: number]>({
        id: 'marker-link-hover-line-arrow',
        iconAtlas: LinkerIndicatorLayer.iconAtlas as unknown as string,
        iconMapping: {
          arrow: {
            width: 64,
            height: 64,
            x: 0,
            y: 0,
            anchorX: 32,
            anchorY: 32,
            mask: true,
          },
        },
        data: points,
        getSize: 12,
        getAngle: angle,
        getColor: [r, g, b],
        getIcon: () => 'arrow',
        getPosition: pos => pos,
      }),
    ]
  }
}
