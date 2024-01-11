import { LinearInterpolator, OrthographicController } from '@deck.gl/core/typed'
import type { ControllerProps } from '@deck.gl/core/typed/controllers/controller'

export class GSMapController extends OrthographicController {
  declare props: ControllerProps & {
    target: [number, number]
    zoom: number
  }

  transition: OrthographicController['transition'] = {
    transitionDuration: 100,
    transitionInterpolator: new LinearInterpolator(['target', 'zoom']),
  }

  // 此处实现 copy 自 OrthographicController['_onWheel']
  // 只是修改了 transitionDuration，使其能够获取用户配置值
  protected _onWheel(...args: Parameters<OrthographicController['_onWheel']>): boolean {
    const [event] = args

    if (!this.scrollZoom)
      return false

    event.srcEvent.preventDefault()

    const pos = this.getCenter(event)
    if (!this.isPointInBounds(pos, event))
      return false

    const { speed = 0.01, smooth = false } = this.scrollZoom === true ? {} : this.scrollZoom
    const { delta } = event

    // Map wheel delta to relative scale
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)))
    if (delta < 0 && scale !== 0)
      scale = 1 / scale

    const newControllerState = this.controllerState.zoom({ pos, scale })
    this.updateViewport(
      newControllerState,
      { ...this._getTransitionProps({ around: pos }), transitionDuration: smooth ? 66 : 1 },
      {
        isZooming: true,
        isPanning: true,
      },
    )
    return true
  }
}
