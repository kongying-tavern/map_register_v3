import type { Component } from 'vue'
import type { useAccessStore } from '@/stores'

export { default as FeatureGrid } from './FeatureGrid.vue'

export interface FeatureOption {
  label: string
  icon: Component
  cb: () => void
  role?: Parameters<ReturnType<typeof useAccessStore>['get']>['0']
}

export interface FeatureGroupOption {
  label: string
  items: FeatureOption[]
}
