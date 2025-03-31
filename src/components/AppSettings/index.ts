import AppSettingLoading from './AppSettingLoading.vue'

export const AppSettings = defineAsyncComponent({
  loader: () => import('./AppSettings.vue'),
  loadingComponent: AppSettingLoading,
})
