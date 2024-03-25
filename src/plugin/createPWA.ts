import type { Plugin } from 'vue'
import { Logger } from '@/utils'
import { usePreferenceStore } from '@/stores'

const logger = new Logger('SW-main')

const swLogger = new Logger('SW-worker', () => !usePreferenceStore().preference['developer.setting.hideServiceWorkerLogger'])

export type ServiceWorkerOutput = {
  action: 'log'
  value: { type: 'info' | 'error'; args: string[] }
} & {
  action: string
  value: unknown
}

const ensureServiceWorker = async () => {
  if (!('serviceWorker' in navigator))
    throw new Error('浏览器不支持 Service Worker 或网站没有运行于安全上下文 (HTTPS、localhost) 中')

  navigator.serviceWorker.addEventListener('message', (ev: MessageEvent<ServiceWorkerOutput>) => {
    if (ev.data.action !== 'log')
      return
    swLogger[ev.data.value.type](...ev.data.value.args)
  })

  const registration = await navigator.serviceWorker.register('/service.worker.js', { scope: '/' })
  await registration.update()
  const result = await navigator.serviceWorker.ready

  logger.info({ registration: result })
}

/** 渐进式 Web 应用所需配置 */
export const createPWA = (): Plugin => ({
  install: async () => {
    await ensureServiceWorker()
  },
})
