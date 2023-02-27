import type { Plugin } from 'vue'
import userCardBorder from '@/style/CSSHoudini/userCardBorder?url'
import userCardInfoBorder from '@/style/CSSHoudini/userCardInfoBorder?url'

/** 类型补丁 */
declare const CSS: {
  paintWorklet: Worklet
}

/** 用于注册 CSS Houdini */
export const csshoudini = (): Plugin => ({
  install: async () => {
    CSS.paintWorklet.addModule(userCardBorder)
    CSS.paintWorklet.addModule(userCardInfoBorder)
  },
})
