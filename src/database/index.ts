import { MainThreadDB } from './db/main'
import { WebsocketDatabase } from './websocket'

const db = new MainThreadDB()

Reflect.set(globalThis, 'db', db)

export const wsdb = new WebsocketDatabase()

export default db
