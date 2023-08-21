/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElForm, ElUpload } from 'element-plus'

export type AnyObject = Record<string, any>
export type AnyArray = any[]
export type AnyFunction<T = any> = (...args: AnyArray) => T
export type ElFormType = InstanceType<typeof ElForm>
export type ElUploadType = InstanceType<typeof ElUpload>

/**
 * 光标类型
 * @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor
 */
export type CursorType =
 | 'auto'
 | 'default'
 | 'none'
 | 'context-menu'
 | 'help'
 | 'pointer'
 | 'progress'
 | 'wait'
 | 'cell'
 | 'crosshair'
 | 'text'
 | 'vertical-text'
 | 'alias'
 | 'copy'
 | 'move'
 | 'no-drop'
 | 'not-allowed'
 | 'grab'
 | 'grabbing'
 | 'all-scroll'
 | 'col-resize'
 | 'row-resize'
 | 'n-resize'
 | 'e-resize'
 | 's-resize'
 | 'w-resize'
 | 'ne-resize'
 | 'nw-resize'
 | 'se-resize'
 | 'sw-resize'
 | 'ew-resize'
 | 'ns-resize'
 | 'nesw-resize'
 | 'nwse-resize'
 | 'zoom-in'
 | 'zoom-out'
