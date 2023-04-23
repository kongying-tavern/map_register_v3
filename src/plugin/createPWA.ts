import { ElNotification } from 'element-plus'
import type { Plugin } from 'vue'
import { Logger } from '@/utils'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'

const logger = new Logger('[PWA]')

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
      message: '请刷新页面以启用',
      position: 'bottom-right',
      duration: 0,
    })
    return
  }
  await registration.update()
}

/** 基于频道通信，使得每条发送信息能得到确认 */
const sendMessage = <T = unknown, R = unknown>(data: T, timeout = 3000) => new Promise<MessageEvent<R>>((resolve, reject) => {
  navigator.serviceWorker.startMessages()

  if (!navigator.serviceWorker.controller)
    return reject(new Error('Service Worker 控制器尚未初始化'))

  const channel = new MessageChannel()

  const closeChannel = () => {
    channel.port1.close()
    channel.port2.close()
  }

  let isFulfilled = false

  const timer = setTimeout(() => {
    if (isFulfilled)
      return
    isFulfilled = true
    closeChannel()
    reject(new Error('action timeout'))
  }, timeout)

  channel.port2.onmessage = (ev: MessageEvent<R>) => {
    resolve(ev)
    if (isFulfilled)
      return
    window.clearTimeout(timer)
    closeChannel()
  }

  navigator.serviceWorker.controller.postMessage({ data, port: channel.port1 }, [channel.port1])
})

export interface ServiceWorkerEnv {
  DEV: boolean
}

interface ChromeFontFaceSet extends FontFaceSet {
  add: (font: FontFace) => FontFaceSet
}

/** 渐进式 Web 应用所需配置 */
export const createPWA = (): Plugin => ({
  install: async () => {
    await ensureServiceWorker()
    // 设置 ServiceWorker 的环境变量
    await sendMessage<ServiceWorkerEnv, string>({ DEV: import.meta.env.DEV })
    // 确保字体都加载完毕
    const mhyGameFont = new FontFace('MHYG', `url(${genshinFont})`)
    await mhyGameFont.load()
    ;(document.fonts as unknown as ChromeFontFaceSet).add(mhyGameFont)
  },
})
