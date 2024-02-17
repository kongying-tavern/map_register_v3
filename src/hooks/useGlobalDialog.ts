import { GlobalDialogController, GlobalDialogService } from '@/components'

export interface PropsOptions {
  /** 合并模式 */
  merge?: boolean
}

/**
 * ### 获取弹窗服务
 *
 * 适用于以下情况：
 * 1. 简单的弹窗表单
 * 2. 列表项弹窗（降低弹窗组件数量，提高性能）等场景
 *
 * 注意事项：
 * 1. 该服务为单例模式
 * 2. 如果你的弹窗很复杂，请直接使用 `el-dialog`
 */
export const useGlobalDialog = () => {
  onDeactivated(() => {
    GlobalDialogController.close(undefined, true)
  })

  onBeforeUnmount(() => {
    GlobalDialogController.close(undefined, true)
  })

  return { DialogService: GlobalDialogService }
}
