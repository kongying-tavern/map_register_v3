import Api from '@/api/config'
import db from '@/database'
import { Zip } from '@/utils'
import { defineStore } from 'pinia'
import { validateDadianJSON } from '@/configs'
import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'

/** 订阅的打点配置 */
export const useDadianStore = defineStore('global-dadian-json', () => {
  const raw = shallowRef<API.DadianJSON>({})

  const meta = shallowRef({
    digest: '',
    version: '',
  })

  const getDigest = async (data: ArrayBuffer) => {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    return [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
  }

  const getVersion = (config: API.DadianJSON) => {
    return `${config.tiles?.['提瓦特-base0'].code ?? '-NA-'} / ${config.tilesNeigui?.['提瓦特-base0'].code ?? '-NA-'}`
  }

  // 直接请求新的配置，当请求失败时回退到本地缓存
  const { refresh: update, loading, onError } = useFetchHook({
    onRequest: async () => {
      const currentDadianData = await Api.getDadianConfig()
      const currentDadianJSON = await Zip.decompressAs<API.DadianJSON>(new Uint8Array(currentDadianData), {
        name: 'dadian',
      })
      raw.value = currentDadianJSON
      const currentDadianDigest = await getDigest(currentDadianData)
      meta.value = {
        digest: currentDadianDigest,
        version: getVersion(currentDadianJSON),
      }
      await db.cache.put({
        id: 'dadian',
        digest: currentDadianDigest,
        value: currentDadianJSON,
      })
    },
  })

  onError(async () => {
    const cachedDadianData = await db.cache.get('dadian')
    if (cachedDadianData && cachedDadianData.id === 'dadian') {
      raw.value = cachedDadianData.value
      meta.value = {
        digest: cachedDadianData.digest,
        version: getVersion(cachedDadianData.value),
      }
    }
  })

  const loadDadianJSON = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker().catch(() => [] as FileSystemFileHandle[])
      if (!fileHandle)
        return
      const file = await fileHandle.getFile()
      if (file.type !== 'application/json')
        return
      const newDadianDigest = await getDigest(await file.arrayBuffer())
      const text = await file.text()
      const json = JSON.parse(text)
      const { valid, errors } = validateDadianJSON(json)
      if (!valid)
        throw new Error(errors ? errors[0]?.message : 'unknown')
      raw.value = json
      meta.value = {
        digest: newDadianDigest,
        version: getVersion(json),
      }
      ElMessage.success('加载成功')
    }
    catch (err) {
      ElMessage.error(`无法加载此配置：${err instanceof Error ? err.message : err}`)
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

  // 名片
  const nameCardList = computed(() => {
    return raw.value.application?.nameCard ?? []
  })

  const nameCardMap = computed(() => nameCardList.value.reduce((map, nameCard) => {
    if (nameCard.label)
      map.set(nameCard.label, nameCard)
    return map
  }, new Map<string, API.NameCardOption>()))

  return {
    raw: computed(() => raw.value),
    meta,
    nameCardList,
    nameCardMap,
    init,
    loadDadianJSON,
    update,
    loading,
  }
})
