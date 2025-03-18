import { MainThreadDB } from './db/main'
import { WebsocketDatabase } from './websocket'

const db = new MainThreadDB()

export const wsdb = new WebsocketDatabase()

export default db
