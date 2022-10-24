import type { Component } from 'vue'
import type { DialogProps } from 'element-plus'

const _visible = ref(false)
const _dialogProps = ref<Omit<Partial<DialogProps>, 'modelValue'>>({})
const _component = shallowRef<Component | null>(null)
const _closeResolver = ref<((payload: any) => void) | null>(null)

class _DialogController {
  static close = <T>(payload?: T) => {
    _visible.value = false
    _closeResolver.value?.(payload)
  }
}

/** 仅供 AppDialogProvider 调用 */
export const useGlobalDialogContext = () => {
  return { visible: _visible, dialogProps: _dialogProps, is: _component, DialogController: _DialogController }
}

export interface PropsOptions {
  /** 合并模式 */
  merge?: boolean
}

export const useGlobalDialog = () => {
  class DialogService {
    /** 传递给 el-dialog 的属性 */
    static config = (propsObj: Omit<Partial<DialogProps>, 'modelValue'>, options: PropsOptions = {}) => {
      const { merge } = options
      if (merge) {
        _dialogProps.value = {
          ..._dialogProps.value,
          ...propsObj,
        }
      }
      else {
        _dialogProps.value = propsObj
      }
      return this
    }

    static close = <T>(payload?: T) => {
      _visible.value = false
      _closeResolver.value?.(payload)
    }

    static afterClosed = <T>() => new Promise<T>((resolve) => {
      _closeResolver.value = resolve
    })

    static open = (comp: Component) => {
      _component.value = comp
      _visible.value = true
      return this
    }
  }

  onBeforeUnmount(() => {
    DialogService.close()
  })

  return { DialogService }
}
