import { defineStore } from 'pinia'
import type { ShallowRef } from 'vue'
import { userHook } from './hooks'
import { Zip } from '@/utils'
import Api from '@/api/config'
import db from '@/database'

/** 订阅的打点配置 */
export const useDadianStore = defineStore('global-dadian-json', () => {
  const raw = shallowRef<API.DadianJSON>({})

  const getDigest = async (data: ArrayBuffer) => {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    return [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
  }

  const update = async () => {
    try {
      const dadianConfigFile = await Api.getDadianConfig()
      const newDigest = await getDigest(dadianConfigFile)

      const cachedConfig = await db.cache.get('dadian')
      if (cachedConfig && cachedConfig.id === 'dadian' && newDigest === cachedConfig.digest) {
        raw.value = cachedConfig.value
        return
      }

      const newConfig = await Zip.decompressAs<API.DadianJSON>(new Uint8Array(dadianConfigFile))
      raw.value = newConfig

      await db.cache.put({
        id: 'dadian',
        digest: newDigest,
        value: newConfig,
      })
    }
    catch {
      const cachedConfig = await db.cache.get('dadian')
      if (cachedConfig && cachedConfig.id === 'dadian')
        raw.value = cachedConfig.value
    }
  }

  const init = async () => {
    await update()
  }

  return {
    _raw: raw as Readonly<ShallowRef<API.DadianJSON>>,

    digest: getDigest,
    update,
    init,
  }
})

userHook.onInfoChange(useDadianStore, async (store) => {
  await store.update()
})
