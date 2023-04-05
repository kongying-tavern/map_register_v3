import type { Plugin } from 'vue'
import userCardBorder from '@/style/CSSHoudini/userCardBorder?url'
import userCardInfoBorder from '@/style/CSSHoudini/userCardInfoBorder?url'
import darkCardBorder from '@/style/CSSHoudini/darkCardBorder?url'
import mapSiderbar from '@/style/CSSHoudini/mapSidebar?url'

/** 类型补丁 */
declare const CSS: {
  paintWorklet: Worklet
}

export const registerPaint = (): Plugin => ({
  install: () => {
    if ('paintWorklet' in CSS) {
      CSS.paintWorklet.addModule(darkCardBorder)
      CSS.paintWorklet.addModule(userCardBorder)
      CSS.paintWorklet.addModule(userCardInfoBorder)
      CSS.paintWorklet.addModule(mapSiderbar)
    }
  },
})
