import type { ControllerProps } from '@deck.gl/core'
import { LinearInterpolator, OrthographicController } from '@deck.gl/core'
import { usePreferenceStore } from '@/stores'

/** @inject 此控制器包含来自 `usePreferenceStore` 的依赖注入 */
export class GSMapController extends OrthographicController {
  declare props: ControllerProps & {
    target: [number, number]
    zoom: number
  }

  /**
   * 默认过渡设置，请勿修改此处的实现。
   * 如果需要过渡，应当在修改状态时提供对应的 `transitionDuration` 和 `transitionInterpolator`。
   */
  transition: OrthographicController['transition'] = {
    transitionDuration: 100,
    transitionInterpolator: new LinearInterpolator(['target', 'zoom']),
  }

  // 此处实现 copy 自 OrthographicController['_onWheel']，
  // 只是添加了依赖注入，使其能够获取用户配置值。
  protected _onWheel(...[event]: Parameters<OrthographicController['_onWheel']>): boolean {
    if (!this.scrollZoom)
      return false

    event.srcEvent.preventDefault()

    const pos = this.getCenter(event)
    if (!this.isPointInBounds(pos, event))
      return false

    const { speed = 0.01, smooth = false } = this.scrollZoom === true ? {} : this.scrollZoom
    const { delta } = event

    let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)))
    if (delta < 0 && scale !== 0)
      scale = 1 / scale

    const newControllerState = this.controllerState.zoom({ pos, scale })
    this.updateViewport(
      newControllerState,
      {
        ...this._getTransitionProps({ around: pos }),
        transitionDuration: smooth
          ? usePreferenceStore().preference['map.setting.zoomTransitionDuration']
          : 0,
      },
      {
        isZooming: true,
        isPanning: true,
      },
    )
    return true
  }
}
