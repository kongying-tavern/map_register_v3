import type { Plugin } from 'vue'
import { Logger } from '@/utils'

const logger = new Logger('[service worker register]')

export interface ServiceWorkerInstallerOptions {
  scope?: string
}

export const createServiceWorker = (options: ServiceWorkerInstallerOptions = {}): Plugin => ({
  install: async () => {
    const { scope = '/' } = options
    try {
      if (!('serviceWorker' in navigator))
        throw new Error('浏览器不支持 service worker')
      const regs = await navigator.serviceWorker.getRegistration(scope)
      if (regs) {
        logger.info('已存在 service worker')
        return
      }
      const swRegistration = await navigator.serviceWorker.register('./serviceWorker.ts', { scope })
      logger.info('注册成功', swRegistration)
    }
    catch (err) {
      logger.error('Error:', err)
    }
  },
})
