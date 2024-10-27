import { Subject } from 'rxjs'
import type { PickingInfo } from '@deck.gl/core'
import type { MjolnirGestureEvent, MjolnirPointerEvent } from 'mjolnir.js'
import type { GenshinMapViewState } from '@/packages/map'

export class MapSubject {
  static readonly viewState = new Subject<Partial<GenshinMapViewState>>()
  static readonly focus = new Subject<FocusEvent>()
  static readonly click = new Subject<{ info: PickingInfo; event: MjolnirGestureEvent }>()
  static readonly hover = new Subject<{ info: PickingInfo; event: MjolnirPointerEvent }>()
  static readonly drag = new Subject<{ info: PickingInfo; event: MjolnirGestureEvent }>()
  static readonly dragEnd = new Subject<{ info: PickingInfo; event: MjolnirGestureEvent }>()
  static readonly dragStart = new Subject<{ info: PickingInfo; event: MjolnirGestureEvent }>()
}
