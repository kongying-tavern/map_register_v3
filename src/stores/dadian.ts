import { defineStore } from 'pinia'
import { UserHook } from './utils'
import { Zip } from '@/utils'
import Api from '@/api/config'

/** 订阅的打点配置 */
export const useDadianStore = defineStore('dadian-json', {
  state: () => ({
    _raw: {} as API.DadianJSON,
    _hash: '',
  }),

  getters: {
  },

  actions: {
    async digest(data: ArrayBuffer) {
      const hashArray = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
      let hashString = ''
      for (let i = 0; i < hashArray.length; i++)
        hashString += hashArray[i].toString(16).padStart(2, '0')
      return hashString
    },

    async update() {
      const file = await Api.getDadianConfig()
      const newHash = await this.digest(file)
      if (newHash === this._hash)
        return
      this._hash = newHash
      const data = await Zip.decompress(new Uint8Array(file))
      const text = new TextDecoder('utf-8').decode(data.buffer)
      const dadianJson = JSON.parse(text) as API.DadianJSON
      this._raw = dadianJson
    },

    async init() {
      await this.update()
    },
  },
})

UserHook.onInfoChange(useDadianStore, async (store) => {
  await store.update()
})
