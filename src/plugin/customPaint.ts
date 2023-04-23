import type { Plugin } from 'vue'

/** 类型补丁 */
declare const CSS: {
  paintWorklet: Worklet
}

/** 注册自定义背景绘制类 */
export const customPaint = (): Plugin => ({
  install: async () => {
    if (!('paintWorklet' in CSS))
      return
    const modules = import.meta.glob('@/style/CSSHoudini/*.js', { as: 'url' })
    Object.keys(modules).forEach((moduleUrl) => {
      CSS.paintWorklet.addModule(moduleUrl)
    })
  },
})
