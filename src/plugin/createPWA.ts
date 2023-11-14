import type { Plugin } from 'vue'
import { Logger } from '@/utils'

const logger = new Logger('[service worker register]')

const ensureServiceWorker = async () => {
  if (!('serviceWorker' in navigator))
    throw new Error('浏览器不支持 Service Worker 或网站没有运行于安全上下文 (HTTPS、localhost) 中')

  const registration = await navigator.serviceWorker.register('/service.worker.js', { scope: '/' })
  await registration.update()
  const sr = await navigator.serviceWorker.ready

  logger.info(sr)
}

/** 渐进式 Web 应用所需配置 */
export const createPWA = (): Plugin => ({
  install: async () => {
    await ensureServiceWorker()
  },
})
