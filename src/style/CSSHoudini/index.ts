import userCardBorder from '@/style/CSSHoudini/userCardBorder?url'
import userCardInfoBorder from '@/style/CSSHoudini/userCardInfoBorder?url'
import darkCardBorder from '@/style/CSSHoudini/darkCardBorder?url'

/** 类型补丁 */
declare const CSS: {
  paintWorklet: Worklet
}
CSS.paintWorklet.addModule(darkCardBorder)
CSS.paintWorklet.addModule(userCardBorder)
CSS.paintWorklet.addModule(userCardInfoBorder)
