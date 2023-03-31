import { ElNotification } from 'element-plus'
import type { Plugin } from 'vue'
import { Logger } from '@/utils'

const logger = new Logger('[SW-main]')

const reloadBtn = `
<button class="el-button el-button--small el-button--primary" onclick="window.location.reload()">
  刷新
</button>
`

const ensureServiceWorker = async () => {
  try {
    if (!('serviceWorker' in navigator))
      throw new Error('浏览器不支持 Service Worker 或网站没有运行于安全上下文 (HTTPS、localhost) 中')

    const registration = await navigator.serviceWorker.getRegistration('/')

    // 如果没有 SW，则注册一个新的
    if (!registration) {
      const newRegistration = await navigator.serviceWorker.register('./serviceWorker.js', { scope: '/' })
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
}

const handleMessage = () => {
  navigator.serviceWorker.addEventListener('message', (ev: MessageEvent<string>) => {
    logger.info('[onmessage]', JSON.parse(ev.data))
  })
}

/** 渐进式 Web 应用所需配置 */
export const createPWA = (): Plugin => ({
  install: async () => {
    await ensureServiceWorker()
    handleMessage()
  },
})
