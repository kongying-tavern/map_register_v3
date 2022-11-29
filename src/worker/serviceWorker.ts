import type { Plugin } from 'vue'

const install = () => {
  if (!('serviceWorker' in navigator))
    return
  navigator.serviceWorker
    .register('./serviceWorker.ts', { scope: './' })
    .then(() => {
      console.log('[service worker] 注册成功')
    })
    .catch((err) => {
      console.error('[service worker] 注册失败:', err)
    })
}

export const serviceWorker: Plugin = {
  install,
}
