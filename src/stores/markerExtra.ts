import { defineStore } from 'pinia'
import { defaultsDeep, pick } from 'lodash'
import { useAccessStore, useDadianStore } from '@/stores'

/** 点位额外信息解析 store */
export const useMarkerExtraStore = defineStore('global-marker-extra', () => {
  const accessStore = useAccessStore()
  const dadianStore = useDadianStore()

  const mergedAreaExtraConfigs = computed(() => {
    const { plugins = {}, pluginsNeigui = {} } = dadianStore._raw

    const isNegui = accessStore.hasNeigui

    const areaExtraConfigs: Record<string, API.ExtraConfig> = {}
    for (const areaCode in plugins) {
      const { extra = [], extraConfig = {} } = plugins[areaCode]
      const { extra: extraNeigui = [], extraConfig: extraConfigNeigui = {} } = pluginsNeigui[areaCode] ?? {}
      const extraKeys = isNegui ? [...extra, ...extraNeigui] : extra
      if (isNegui)
        defaultsDeep(extraConfig, extraConfigNeigui)
      areaExtraConfigs[areaCode] = pick(extraConfig, extraKeys)
    }

    return areaExtraConfigs
  })

  return {
    mergedAreaExtraConfigs,
  }
})
