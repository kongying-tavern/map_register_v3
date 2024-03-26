import { defineStore } from 'pinia'
import type { LogInfo } from '@/utils'

/** 开发者工具 store */
export const useDevStore = defineStore('global-dev', () => {
  const logList = ref<LogInfo[]>([])

  const clearLogs = () => {
    logList.value = []
  }

  return {
    logList,
    clearLogs,
  }
})
