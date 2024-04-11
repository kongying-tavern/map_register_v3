import { EventBus } from '@/utils/EventBus'

/* eslint-disable no-console */
const isDebug = import.meta.env.DEV

export interface LoggerOptions {
  dateTimeColor?: string
  labelBackground?: string
  labelColor?: string
  port?: MessagePort
}

export type LogType = 'info' | 'warn' | 'error'

export interface LogInfo {
  type: LogType
  timestamp: number
  args: unknown[]
}

export interface LoggerEvents {
  log: [LogInfo]
}

/** 开发模式下在命令行打印信息 */
export class Logger {
  #prefix: string
  #options: LoggerOptions
  #enable = () => true

  static event = new EventBus<LoggerEvents>()

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

  #log = (type: LogType) => (...args: unknown[]) => {
    if (!this.#enable())
      return

    const timestamp = Date.now()

    if (this.#options.port) {
      this.#options.port.postMessage({ type, message: args })
      Logger.event.emit('log', { type, timestamp, args })
      return
    }

    const logs = [this.#getPrefix(), ...this.#getStyle(), ...args]

    isDebug && console[type](...logs)

    Logger.event.emit('log', { type, timestamp, args: logs })
  }

  info = this.#log('info')

  warn = this.#log('warn')

  error = this.#log('error')
}
