import type { Component, SlotsType } from 'vue'
import type { DialogProps } from 'element-plus'
import { context } from './context'
import { GlobalDialogController } from './GlobalDialogController'
import type { AnyObject } from '@/shared'

export interface PropsOptions {
  /** 合并模式 */
  merge?: boolean
}

export type PropsObject = Omit<Partial<DialogProps & { class: string }>, 'modelValue'> // 这里先 hack 一下类型，等 element 更新 2.3.0

/** 全局弹窗服务，内部调用 */
export class GlobalDialogService {
  /** 传递给 el-dialog 的属性 */
  static config = (
    propsObj: PropsObject,
    options: PropsOptions = {},
  ) => {
    const { merge } = options
    if (merge)
      Object.assign(context.dialogProps.value, propsObj)
    else
      context.dialogProps.value = propsObj
    return this
  }

  /** 传递给弹窗默认插槽上的组件的属性 */
  static props = <T extends AnyObject>(propsObj: T, options: PropsOptions = {}) => {
    const { merge } = options
    if (merge)
      Object.assign(context.props.value, propsObj)
    else
      context.props.value = propsObj
    return this
  }

  /** 传递给弹窗默认插槽上的组件的事件监听器 */
  static listeners = <T extends Record<string, Function>>(listenersObj: T) => {
    context.listener.value = {
      ...listenersObj,
    }

    return this
  }

  /** 打开弹窗，返回弹窗控制器 */
  static open = (comp: Component, slots?: SlotsType) => {
    context.visible.value && GlobalDialogController.close(undefined, true)
    context.component.value = comp
    context.slots.value = slots ?? {}
    context.visible.value = true
    return GlobalDialogController
  }
}
