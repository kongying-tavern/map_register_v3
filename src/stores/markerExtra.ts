import { defineStore } from 'pinia'
import { defaultsDeep, pick } from 'lodash'
import { useDadianStore, useUserStore } from '@/stores'

export const useMarkerExtraStore = defineStore('marker-extra', {
  getters: {
    mergedAreaExtraConfigs: () => {
      const { plugins = {}, pluginsNeigui = {} } = useDadianStore()._raw
      const isNegui = useUserStore().isNeigui
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
    },
  },
})
