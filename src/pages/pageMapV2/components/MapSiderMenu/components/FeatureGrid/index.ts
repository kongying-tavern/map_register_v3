import type { Component } from 'vue'

export { default as FeatureGrid } from './FeatureGrid.vue'

export interface FeatureOption {
  label: string
  icon: Component
  cb: () => void
}
