import { WebsocketDatabase } from '@/database/websocket'

class SocketLogger {
  db = new WebsocketDatabase()
  tabId = crypto.randomUUID()

  info = (msg: string) => this.db.logs.add({
    t: Date.now(),
    msg,
    type: 0,
  })

  error = (msg: string) => this.db.logs.add({
    t: Date.now(),
    msg,
    type: 1,
  })
}

export const socketLogger = new SocketLogger()
