import { fromEvent } from 'rxjs'

export const globalKeydown$ = fromEvent<KeyboardEvent>(window, 'keydown')
export const globalKeyUp$ = fromEvent<KeyboardEvent>(window, 'keyup')
export const globalPointerup$ = fromEvent(window, 'pointerup')
