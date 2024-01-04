/* eslint-disable no-console */
const debug = import.meta.env.DEV

/** 开发模式下在命令行打印信息 */
export class Logger {
  #prefix

  #enable = () => true

  constructor(prefix = '', enable: (() => boolean) | undefined = undefined) {
    this.#prefix = prefix
    if (enable)
      this.#enable = enable
  }

  static #groups: string[] = []

  static group = (label: string) => {
    if (!debug)
      return
    this.#groups.push(label)
    console.groupCollapsed(label)
  }

  static groupEnd = () => {
    if (!debug)
      return
    console.groupEnd()
    this.#groups.pop()
  }

  static allGroupsEnd = () => {
    this.#groups.forEach(() => {
      console.groupEnd()
    })
    this.#groups = []
  }

  #stdoutCache = ''

  stdout = {
    write: (char: string) => {
      this.#stdoutCache += char
    },
    getCache: () => this.#stdoutCache,
    print: () => {
      console.group(this.#prefix)
      console.log(this.#stdoutCache)
      console.groupEnd()
    },
  }

  #now = () => new Date().toLocaleString('zh-CN', { hour12: false })

  info = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.log(
      `%c[${this.#now()}] %c${this.#prefix} >`,
      'color: green',
      'color: aqua',
      ...args,
    )
  }

  warn = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.warn(
      `%c[${this.#now()}] %c${this.#prefix} >`,
      'color: green',
      'color: aqua',
      ...args,
    )
  }

  error = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.error(
      `%c[${this.#now()}] %c${this.#prefix} >`,
      'color: green',
      'color: aqua',
      ...args,
    )
  }
}
