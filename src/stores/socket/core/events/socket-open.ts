import type { Socket } from 'socket.io-client'

/** socket 连接建立 */
export class SocketOpenEvent extends Event {
  constructor(public socket: Socket) {
    super('open')
  }
}
