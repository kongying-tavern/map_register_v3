import type { Plugin } from 'vue'
import { useDevStore } from '@/stores'
import { Logger } from '@/utils'

/** 用于在主线程打印并记录日志的插件 */
export const createLogger = (): Plugin => ({
  install: () => {
    const devStore = useDevStore()
    Logger.event.on('log', (log) => {
      devStore.logList.push(log)
    })
  },
})
