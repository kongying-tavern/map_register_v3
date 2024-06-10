/* eslint-disable no-console */
import { defineStore } from 'pinia'
import { usePreferenceStore } from '.'
import type { LogInfo } from '@/utils'
import { Logger } from '@/utils'

/** 开发者工具 store */
export const useDevStore = defineStore('global-dev', () => {
  const preferenceStore = usePreferenceStore()

  const enableLoggers = computed(() => new Set(preferenceStore.preference['developer.setting.enableLoggers']))

  const loggerLabels = ref(new Set<string>())

  const logList = ref<LogInfo[]>([])

  const visibleLogList = computed(() => logList.value.filter(({ label }) => enableLoggers.value.has(label)))

  const preLogList = ref<LogInfo[]>([])

  const handleLog = (logInfo: LogInfo) => {
    if (preferenceStore.preference['developer.setting.enableLoggers'] === undefined) {
      preLogList.value.push(logInfo)
      return
    }

    logList.value.push(logInfo)

    if (!enableLoggers.value.has(logInfo.label))
      return

    const { type, args } = logInfo
    console[type](...args)
  }

  watch(() => preferenceStore.preference['developer.setting.enableLoggers'], () => {
    preLogList.value.forEach(handleLog)
    preLogList.value = []
  })

  const registerLogger = (label: string) => {
    if (loggerLabels.value.has(label))
      return
    loggerLabels.value.add(label)
  }

  const initLogger = () => {
    if (Logger.isInit)
      return
    Logger.loggerLabelsCache.forEach(registerLogger)
    Logger.logsCache.forEach(handleLog)
    Logger.init()
    Logger.event.on('register', registerLogger)
    Logger.event.on('log', handleLog)
  }

  const clearLogs = () => {
    console.clear()
    logList.value = []
  }

  const refreshLogs = () => {
    console.clear()
    visibleLogList.value.forEach(({ type, args }) => console[type](...args))
  }

  return {
    enableLoggers,
    loggerLabels,
    logList,
    visibleLogList,
    clearLogs,
    refreshLogs,
    initLogger,
  }
})
