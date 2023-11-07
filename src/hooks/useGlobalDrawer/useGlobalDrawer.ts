import { onBeforeRouteLeave } from 'vue-router'
import { DrawerService } from './drawerService'
import { DrawerController } from './drawerController'

export interface PropsOptions {
  /** 合并模式 */
  merge?: boolean
}

/**
 * ### 获取抽屉服务
 *
 * 适用于以下情况：
 * 1. 简单的抽屉表单
 * 2. 列表项抽屉（降低抽屉组件数量，提高性能）等场景
 *
 * 注意事项：
 * 1. 该服务为单例模式
 * 2. 如果你的抽屉很复杂，请直接使用 `el-drawer`
 */
export const useGlobalDrawer = () => {
  onBeforeRouteLeave(() => {
    DrawerController.close(undefined, true)
  })

  onBeforeUnmount(() => {
    DrawerController.close(undefined, true)
  })

  return { DrawerService }
}
