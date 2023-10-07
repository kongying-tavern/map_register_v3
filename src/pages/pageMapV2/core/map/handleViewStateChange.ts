import type { OrbitViewState } from '@deck.gl/core/typed'
import type { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller'
import { clamp } from 'lodash'
import type { GenshinMap } from '.'
import { TRANSITION } from '@/pages/pageMapV2/shared'

export interface GensinMapViewState extends Omit<OrbitViewState, 'target'> {
  minZoom: number
  maxZoom: number
  target: API.Coordinate2D
}

export interface GenshinViewStateChangeParameters extends ViewStateChangeParameters {
  viewState: GensinMapViewState
  oldViewState?: GensinMapViewState
}

export const handleViewStateChange = (thisContext: GenshinMap, params: ViewStateChangeParameters): GenshinViewStateChangeParameters => {
  const newState = params.viewState as GensinMapViewState
  const oldState = params.oldViewState as GensinMapViewState | undefined

  if (!oldState)
    return params as GenshinViewStateChangeParameters

  if (thisContext.store.map.lockViewState)
    return { ...params, viewState: oldState } as GenshinViewStateChangeParameters

  const getTargetInsideBounds = (): API.Coordinate2D => {
    if (!thisContext.baseLayer)
      return newState.target
    const [xmin, ymax, xmax, ymin] = thisContext.baseLayer.rawProps.bounds
    return [clamp(newState.target[0], xmin, xmax), clamp(newState.target[1], ymin, ymax)]
  }

  const { isZooming, isDragging } = params.interactionState
  const { target, transitionDuration, transitionEasing } = newState

  const rewriteState: GensinMapViewState = {
    ...newState,
    // 非拖拽情况下（编程式导航）取消边界限制避免视口转换时卡住的问题
    target: isDragging ? getTargetInsideBounds() : target,
    // 这里给 32 而不是 0 会看起来更加流畅，32ms 过渡时间大约能在 60 帧刷新率下提供 2 帧间隔
    transitionDuration: isZooming ? 32 : transitionDuration,
    transitionEasing: isZooming ? TRANSITION.LINEAR : transitionEasing,
  }

  thisContext.mainViewState = rewriteState
  isZooming && thisContext.baseLayer?.forceUpdate()

  return { ...params, viewState: rewriteState } as GenshinViewStateChangeParameters
}
