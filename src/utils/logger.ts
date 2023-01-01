const debug = import.meta.env.DEV

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
