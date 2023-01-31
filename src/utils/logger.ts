/* eslint-disable @typescript-eslint/no-explicit-any */

const debug = import.meta.env.DEV

/** 开发模式下在命令行打印信息 */
export class Logger {
  constructor(private prefix = '') {}

  info = (...args: any[]) => {
    if (import.meta.env.MODE !== 'development')
      return
    // eslint-disable-next-line no-console
    debug && console.log(this.prefix, ...args)
  }

  error = (...args: any[]) => {
    if (import.meta.env.MODE !== 'development')
      return

    debug && console.error(this.prefix, ...args)
  }
}
