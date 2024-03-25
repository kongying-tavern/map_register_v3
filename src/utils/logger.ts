/* eslint-disable no-console */
const debug = import.meta.env.DEV

export interface LoggerOptions {
  dateTimeColor?: string
  labelBackground?: string
  labelColor?: string
}

/** 开发模式下在命令行打印信息 */
export class Logger {
  #prefix: string
  #options: LoggerOptions
  #enable = () => true

  constructor(
    prefix = '',
    enable: () => boolean = () => true,
    options: LoggerOptions = {},
  ) {
    this.#prefix = prefix
    this.#options = options
    this.#enable = enable
  }

  #getPrefix = () => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    return `%c[${now}]%c${this.#prefix}`
  }

  #stringifyStyle = (style: Record<string, string>) => {
    return Object
      .entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
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

  #getStyle = () => {
    const {
      dateTimeColor = 'green',
      labelBackground = '#393B40',
      labelColor = '#DEBC60',
    } = this.#options
    Object.entries({}).map(([key, value]) => `${key}:${value}`).join(',')
    return [
      this.#stringifyStyle({
        color: dateTimeColor,
      }),
      this.#stringifyStyle({
        'background-color': labelBackground,
        'color': labelColor,
        'padding': '0.25em 0.5em',
        'margin': '0 4px',
        'border-radius': '2px',
      }),
    ]
  }

  info = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.log(this.#getPrefix(), ...this.#getStyle(), ...args)
  }

  warn = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.warn(this.#getPrefix(), ...this.#getStyle(), ...args)
  }

  error = (...args: unknown[]) => {
    if (!debug || !this.#enable())
      return
    console.error(this.#getPrefix(), ...this.#getStyle(), ...args)
  }
}
