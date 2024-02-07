import type { DrawerProps } from 'element-plus'
import { closeResolver, drawerProps, resolveResult, visible } from './drawerContext'
import type { DrawerPropsOptions } from './drawerService'

/** 抽屉控制器，由子组件调用 */
export class DrawerController {
  /** 传递给 el-drawer 的属性 */
  static config = (propsObj: Omit<Partial<DrawerProps>, 'modelValue'>, options: DrawerPropsOptions = {}) => {
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

  static close = <T>(payload?: T, ignoreResult = false) => {
    visible.value = false
    !ignoreResult && resolveResult(payload)
  }

  /** 等待抽屉关闭后获取数据 */
  static afterClosed = <T>() => new Promise<T | undefined>((resolve) => {
    closeResolver.value = resolve as (value: unknown) => void
  })
}
