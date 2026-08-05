import { CacheDexie } from './db/cache'
import { MainThreadDB } from './db/main'
import { WebsocketDatabase } from './websocket'

const db = new MainThreadDB()
const cache = new CacheDexie()

export const wsdb = new WebsocketDatabase()
export { cache }

export default db
