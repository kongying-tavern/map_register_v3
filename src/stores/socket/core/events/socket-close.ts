import type { Socket } from 'socket.io-client'

/** socket 连接关闭 */
export class SocketCloseEvent extends Event {
  constructor(public socket: Socket) {
    super('close')
  }
}
