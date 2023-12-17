import { defineStore } from 'pinia'
import { defaultsDeep, pick } from 'lodash'
import { useDadianStore, useUserInfoStore } from '@/stores'

/** 点位额外信息解析 store */
export const useMarkerExtraStore = defineStore('global-marker-extra', () => {
  const dadianStore = useDadianStore()
  const userInfoStore = useUserInfoStore()

  const mergedAreaExtraConfigs = computed(() => {
    const { plugins = {}, pluginsNeigui = {} } = dadianStore._raw
    const isNegui = userInfoStore.isNeigui

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
