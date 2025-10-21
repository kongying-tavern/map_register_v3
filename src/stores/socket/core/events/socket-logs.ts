/** 日志事件 */
export class SocketLogEvent extends Event {
  constructor(public message: string) {
    super('log')
  }
}
