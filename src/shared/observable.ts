import { filter, fromEvent } from 'rxjs'

export const globalKeydown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
  filter(ev => ev.key !== undefined), // chrome 自动填充会触发无 key 的 keydown 事件
)
export const globalKeyUp$ = fromEvent<KeyboardEvent>(window, 'keyup')
export const globalPointerDown$ = fromEvent<PointerEvent>(window, 'pointerdown')
export const globalPointerMove$ = fromEvent<PointerEvent>(window, 'pointermove')
export const globalPointerup$ = fromEvent<PointerEvent>(window, 'pointerup')
export const globalTouchstart$ = fromEvent<TouchEvent>(window, 'touchstart')
export const globalTouchmove$ = fromEvent<TouchEvent>(window, 'touchmove')
export const globalTouchend$ = fromEvent<TouchEvent>(window, 'touchend')
