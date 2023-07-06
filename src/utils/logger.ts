/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const debug = import.meta.env.DEV

/** 开发模式下在命令行打印信息 */
export class Logger {
  constructor(private prefix = '') {}

  static group = (...label: string[]) => {
    if (!debug)
      return
    console.groupCollapsed(...label)
  }

  static groupEnd = () => {
    if (!debug)
      return
    console.groupEnd()
  }

  #stdoutCache = ''

  stdout = {
    write: (char: string) => {
      this.#stdoutCache += char
    },
    getCache: () => this.#stdoutCache,
    print: () => {
      console.group(this.prefix)
      console.log(this.#stdoutCache)
      console.groupEnd()
    },
  }

  info = (...args: any[]) => {
    if (!debug)
      return
    console.log(this.prefix, ...args)
  }

  error = (...args: any[]) => {
    if (!debug)
      return
    console.error(this.prefix, ...args)
  }
}
