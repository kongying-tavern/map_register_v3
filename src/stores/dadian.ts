import { defineStore } from 'pinia'
import type { ShallowRef } from 'vue'
import { userHook } from './hooks'
import { useUserInfoStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/config'
import db from '@/database'

/** 订阅的打点配置 */
export const useDadianStore = defineStore('global-dadian-json', () => {
  const raw = shallowRef<API.DadianJSON>({})

  // 自动加载字体资源
  watch(raw, ({ editor = {} }) => {
    const familySet = new Set<string>()
    document.fonts.forEach((fontFace) => {
      familySet.add(fontFace.family)
    })

    const { fontResources = {} } = editor
    const mission = Object.entries(fontResources).filter(([family]) => !familySet.has(family))
    if (!mission.length)
      return

    mission.forEach(([family, { url }]) => {
      if (familySet.has(family))
        return
      const fontFace = new FontFace(family, `url(${url})`)
      document.fonts.add(fontFace)
      fontFace.load()
    })
  })

  const getDigest = async (data: ArrayBuffer) => {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    return [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
  }

  const update = async () => {
    const { id } = useUserInfoStore().info
    if (id === undefined) {
      raw.value = {}
      return
    }

    try {
      const dadianConfigFile = await Api.getDadianConfig()
      const newDigest = await getDigest(dadianConfigFile)

      const cachedConfig = await db.cache.get('dadian')
      if (cachedConfig && cachedConfig.id === 'dadian' && newDigest === cachedConfig.digest) {
        raw.value = cachedConfig.value
        return
      }

      const newConfig = await Zip.decompressAs<API.DadianJSON>(new Uint8Array(dadianConfigFile), {
        name: 'dadian',
      })
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
