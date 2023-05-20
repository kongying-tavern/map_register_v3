import { render } from 'vue'
import GSMessage from './GSMessage.vue'

export interface GSMessageProps {
  message: string
  /**
   * message 关闭前的等待时间
   * @min 1000
   */
  duration?: number
}

/** 全局消息提示，单例模式 */
export class GSMessageService {
  static #container = (() => {
    const ele = document.createElement('div')
    ele.className = 'gs-message-container'
    ele.addEventListener('animationend', (ev) => {
      if (ev.animationName !== 'gs-message-model-anime-out')
        return
      this.#onClose()
    })
    return ele
  })()

  static #onClose = () => {
    render(null, this.#container)
  }

  static info = (message: string, options: Omit<GSMessageProps, 'message'> = {}) => {
    this.close()
    const vnode = h(GSMessage, {
      message,
      ...options,
    })
    render(vnode, this.#container)
    document.body.appendChild(this.#container)
    this.#container.classList.remove('closed')
    this.#container.classList.add('actived')
  }

  static close = () => {
    this.#container.classList.remove('actived')
    this.#container.classList.add('closed')
  }
}
