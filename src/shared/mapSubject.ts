import type { GenshinMapProps, GenshinMapViewState } from '@/packages/map'
import { Subject } from 'rxjs'

export class MapSubject {
  static readonly viewState = new Subject<Partial<GenshinMapViewState>>()
  static readonly focus = new Subject<FocusEvent>()
  static readonly click = new Subject<{
    info: Parameters<NonNullable<GenshinMapProps['onClick']>>[0]
    event: Parameters<NonNullable<GenshinMapProps['onClick']>>[1]
  }>()

  static readonly hover = new Subject<{
    info: Parameters<NonNullable<GenshinMapProps['onHover']>>[0]
    event: Parameters<NonNullable<GenshinMapProps['onHover']>>[1]
  }>()

  static readonly drag = new Subject<{
    info: Parameters<NonNullable<GenshinMapProps['onDrag']>>[0]
    event: Parameters<NonNullable<GenshinMapProps['onDrag']>>[1]
  }>()

  static readonly dragEnd = new Subject<{
    info: Parameters<NonNullable<GenshinMapProps['onDragEnd']>>[0]
    event: Parameters<NonNullable<GenshinMapProps['onDragEnd']>>[1]
  }>()

  static readonly dragStart = new Subject<{
    info: Parameters<NonNullable<GenshinMapProps['onDragStart']>>[0]
    event: Parameters<NonNullable<GenshinMapProps['onDragStart']>>[1]
  }>()
}
