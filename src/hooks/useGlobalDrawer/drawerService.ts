import type { Component } from 'vue'
import type { DrawerProps } from 'element-plus'
import { component, drawerProps, eventListener, props, visible } from './drawerContext'
import { DrawerController } from './drawerController'
import type { AnyObject } from '@/shared'

export interface DrawerPropsOptions {
  /** 合并模式 */
  merge?: boolean
}

/** 全局抽屉服务，内部调用 */
export class DrawerService {
  /** 传递给 el-drawer 的属性 */
  static config = (
    propsObj: Omit<Partial<DrawerProps & { class: string }>, 'modelValue'>, // 这里先 hack 一下类型，等 element 更新 2.3.0
    options: DrawerPropsOptions = {},
  ) => {
    const { merge } = options
    if (merge) {
      drawerProps.value = {
        ...drawerProps.value,
        ...propsObj,
      }
    }
    else {
      drawerProps.value = propsObj
    }
    return this
  }

  /** 传递给抽屉默认插槽上的组件的属性 */
  static props = <T extends AnyObject>(propsObj: T, options: DrawerPropsOptions = {}) => {
    const { merge } = options
    if (merge) {
      props.value = {
        ...drawerProps.value,
        ...propsObj,
      }
    }
    else {
      props.value = propsObj
    }
    return this
  }

  /** 传递给抽屉默认插槽上的组件的事件监听器 */
  static listeners = <T extends Record<string, (...args: unknown[]) => void>>(listenersObj: T) => {
    eventListener.value = {
      ...listenersObj,
    }

    return this
  }

  /** 打开抽屉，返回抽屉控制器 */
  static open = (comp: Component) => {
    visible.value && DrawerController.close(undefined, true)
    component.value = comp
    visible.value = true
    return DrawerController
  }
}
