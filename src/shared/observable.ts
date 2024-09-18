import { filter, fromEvent } from 'rxjs'

export const globalKeydown$ = fromEvent<KeyboardEvent>(window, 'keydown')
  // chrome 自动填充会触发无 key 的 keydown 事件
  .pipe(filter(ev => ev.key !== undefined))

export const globalKeyUp$ = fromEvent<KeyboardEvent>(window, 'keyup')
export const globalPointerup$ = fromEvent(window, 'pointerup')
