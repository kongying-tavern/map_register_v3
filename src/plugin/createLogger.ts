import type { Plugin } from 'vue'
import { useDevStore } from '@/stores'

/** 用于在主线程打印并记录日志的插件 */
export const createLogger = (): Plugin => ({
  install: () => {
    useDevStore().initLogger()
  },
})
