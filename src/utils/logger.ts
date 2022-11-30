export class Logger {
  constructor(private prefix = '') {}

  info = (...args: any[]) => {
    if (import.meta.env.MODE !== 'development')
      return
    console.log(this.prefix, ...args)
  }

  error = (...args: any[]) => {
    if (import.meta.env.MODE !== 'development')
      return
    console.error(this.prefix, ...args)
  }
}
