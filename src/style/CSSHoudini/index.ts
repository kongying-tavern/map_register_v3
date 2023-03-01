import userCardBorder from '@/style/CSSHoudini/userCardBorder?url'
import userCardInfoBorder from '@/style/CSSHoudini/userCardInfoBorder?url'

/** 类型补丁 */
declare const CSS: {
  paintWorklet: Worklet
}
CSS.paintWorklet.addModule(userCardBorder)
CSS.paintWorklet.addModule(userCardInfoBorder)
