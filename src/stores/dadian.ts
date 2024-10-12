import { defineStore } from 'pinia'
import type { ShallowRef } from 'vue'
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
      const newDadianData = await Api.getDadianConfig()
      const newDadianDigest = await getDigest(newDadianData)
      const dadianCache = await db.cache.get('dadian')
      if (dadianCache && dadianCache.id === 'dadian' && newDadianDigest === dadianCache.digest) {
        raw.value = dadianCache.value
        return
      }
      const newDadianJSON = await Zip.decompressAs<API.DadianJSON>(new Uint8Array(newDadianData), {
        name: 'dadian',
      })
      raw.value = newDadianJSON
      await db.cache.put({
        id: 'dadian',
        digest: newDadianDigest,
        value: newDadianJSON,
      })
    }
    catch {
      const cachedConfig = await db.cache.get('dadian')
      if (cachedConfig && cachedConfig.id === 'dadian')
        raw.value = cachedConfig.value
    }
  }

  const isInit = ref(false)
  const init = async () => {
    if (isInit.value)
      return
    await update()
    isInit.value = true
  }

  const fontFamilySet = new Set<string>()

  // 自动加载字体资源
  watch(() => raw.value?.editor?.fontResources, (fontResources = {}) => {
    Object.entries(fontResources).forEach(([family, { url }]) => {
      if (fontFamilySet.has(family))
        return
      fontFamilySet.add(family)
      const fontFace = new FontFace(family, `url(${url})`)
      document.fonts.add(fontFace)
      fontFace.load()
    })
  })

  return {
    raw: raw as Readonly<ShallowRef<API.DadianJSON>>,
    init,
  }
})
