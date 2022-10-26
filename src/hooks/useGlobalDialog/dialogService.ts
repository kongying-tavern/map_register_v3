import type { Component } from 'vue'
import type { DialogProps } from 'element-plus'
import { component, dialogProps, props, visible } from './dialogContext'
import { DialogController } from './dialogController'

export interface PropsOptions {
  /** 合并模式 */
  merge?: boolean
}

/** 全局弹窗服务，内部调用 */
export class DialogService {
  /** 传递给 el-dialog 的属性 */
  static config = (propsObj: Omit<Partial<DialogProps>, 'modelValue'>, options: PropsOptions = {}) => {
    const { merge } = options
    if (merge) {
      dialogProps.value = {
        ...dialogProps.value,
        ...propsObj,
      }
    }
    else {
      dialogProps.value = propsObj
    }
    return this
  }

  /** 传递给弹窗默认插槽上的组件的属性 */
  static props = <T extends Record<string, any>>(propsObj: T, options: PropsOptions = {}) => {
    const { merge } = options
    if (merge) {
      props.value = {
        ...dialogProps.value,
        ...propsObj,
      }
    }
    else {
      props.value = propsObj
    }
    return this
  }

  /** 打开弹窗，返回弹窗控制器 */
  static open = (comp: Component) => {
    visible.value && DialogController.close(undefined, true)
    component.value = comp
    visible.value = true
    return DialogController
  }
}
