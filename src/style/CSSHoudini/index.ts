import type { Plugin } from 'vue'
import usercardPainter from '@/style/CSSHoudini/userCardWorklet?url'

declare const CSS: {
  paintWorklet: Worklet
}

/** 用于注册 CSS Houdini */
export const csshoudini = (): Plugin => ({
  install: async () => {
    CSS.paintWorklet.addModule(usercardPainter)
  },
})
