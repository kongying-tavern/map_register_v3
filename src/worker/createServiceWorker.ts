import { ElNotification } from 'element-plus'
import type { Plugin } from 'vue'
import { Logger } from '@/utils'

const LATEST_SERVICE_WORKER_URL = './serviceWorker.js'

const logger = new Logger('[service worker register]')

export interface ServiceWorkerInstallerOptions {
  scope?: string
}

const reloadBtn = `
<button class="el-button el-button--small el-button--primary" onclick="window.location.reload()">
  刷新
</button>
`

/** 用于注册 service worker */
export const createServiceWorker = (options: ServiceWorkerInstallerOptions = {}): Plugin => ({
  install: async () => {
    const { scope = '/' } = options

    try {
      if (!('serviceWorker' in navigator))
        throw new Error('浏览器不支持 Service Worker 或网站没有运行于安全上下文 (HTTPS、localhost) 中')

      const registration = await navigator.serviceWorker.getRegistration(scope)

      // 如果没有 SW，则注册一个新的
      if (!registration) {
        const newRegistration = await navigator.serviceWorker.register(LATEST_SERVICE_WORKER_URL, { scope })
        logger.info('注册成功', newRegistration)
        ElNotification.success({
          title: 'Service Worker 已经可用',
          dangerouslyUseHTMLString: true,
          message: `刷新页面以启用： ${reloadBtn}`,
          position: 'bottom-right',
          duration: 0,
        })
        return
      }

      await registration.update()
    }
    catch (err) {
      logger.error(err)
    }
  },
})
