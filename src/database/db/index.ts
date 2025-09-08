import { AppDexie } from './app'
import { CacheDexie } from './cache'

const db = {
  app: new AppDexie(),
  cache: new CacheDexie(),
}

export default db
