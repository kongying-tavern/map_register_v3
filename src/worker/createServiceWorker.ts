import type { Plugin } from 'vue'
import { Logger } from '@/utils'
import { useUserStore } from '@/stores'

const logger = new Logger('[service worker register]')

export interface ServiceWorkerInstallerOptions {
  scope?: string
}

/** 用于注册 service worker */
export const createServiceWorker = (options: ServiceWorkerInstallerOptions = {}): Plugin => ({
  install: async () => {
    const { scope = '/' } = options

    const userStore = useUserStore()

    const refreshAuth = useThrottleFn(userStore.refreshAuth, 5000)

    try {
      if (!('serviceWorker' in navigator))
        throw new Error('浏览器不支持 service worker')
      const regs = await navigator.serviceWorker.getRegistration(scope)
      if (regs) {
        logger.info('已存在 service worker')
      }
      else {
        const swRegistration = await navigator.serviceWorker.register('./serviceWorker.js', { scope })
        logger.info('注册成功', swRegistration)
      }
      navigator.serviceWorker.addEventListener('message', refreshAuth)
    }
    catch (err) {
      logger.error('Error:', err)
    }
  },
})
