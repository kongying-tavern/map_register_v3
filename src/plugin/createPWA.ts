import { ElNotification } from 'element-plus'
import type { Plugin } from 'vue'
import { Logger } from '@/utils'

const logger = new Logger('[PWA]')

const reloadBtn = `
<button class="el-button el-button--small el-button--primary" onclick="window.location.reload()">
  刷新
</button>
`

const ensureServiceWorker = async () => {
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

const ensuerMessageHandler = () => navigator.serviceWorker.addEventListener('message', (ev: MessageEvent<string>) => {
  const payload = JSON.parse(ev.data)
  logger.info('[onmessage]', payload)
})

export interface ServiceWorkerActionProps<T = unknown> {
  action: string
  type?: string
  value?: T
}

/** 一个通用方法，用于以固定模式向 ServiceWorker 发送一个行动并确保其回复 */
const postAction = <T>(props: ServiceWorkerActionProps<T>, timeout = 3000) => new Promise<void>((resolve, reject) => {
  let isFulfilled = false

  const handler = (ev: MessageEvent<string>) => {
    const payload = JSON.parse(ev.data)
    const { action, value } = payload as ServiceWorkerActionProps
    if (action !== 'roger' || value !== props.action)
      return
    if (isFulfilled)
      return
    isFulfilled = true
    resolve()
    navigator.serviceWorker.removeEventListener('message', handler)
  }

  navigator.serviceWorker.addEventListener('message', handler)
  navigator.serviceWorker.controller?.postMessage(JSON.stringify(props))

  setTimeout(() => {
    if (isFulfilled)
      return
    isFulfilled = true
    reject(new Error('action timeout'))
    navigator.serviceWorker.removeEventListener('message', handler)
  }, timeout)
})

/** 渐进式 Web 应用所需配置 */
export const createPWA = (): Plugin => ({
  install: async () => {
    await ensureServiceWorker()
    ensuerMessageHandler()

    await postAction({
      action: 'setEnvValue',
      type: 'boolean',
      value: import.meta.env.DEV,
    })
  },
})