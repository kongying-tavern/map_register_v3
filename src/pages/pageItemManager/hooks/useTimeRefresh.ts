import type { Ref } from 'vue'

interface FormTimeRefreshParamHooksOptions {
  formData: Ref<API.ItemVo>
}

interface RefreshTimeObj {
  days: number
  hour: number
  min: number
  sec: number
}

export const useTimeRefresh = (options: FormTimeRefreshParamHooksOptions) => {
  const { formData } = options

  const timeSelectDisabled = ref(true)

  const refreshTimeOptions = ref([
    {
      label: '不刷新',
      value: 0,
    },
    {
      label: '次日',
      value: 1,
    },
    {
      label: '自定义',
      value: 2,
    },
  ])

  const _refreshTime = ref<RefreshTimeObj>({
    days: 0,
    hour: 0,
    min: 0,
    sec: 0,
  })

  const refreshTime = computed({
    get: () => {
      const time = (formData.value.defaultRefreshTime ?? 0) / 1000
      const days = Math.floor(time / 24 / 3600)
      const hour = Math.floor(time / 3600 - days * 24)
      const min = Math.floor(time / 60 - days * 24 * 60 - hour * 60)
      const sec = time % 60

      _refreshTime.value = {
        days,
        hour,
        min,
        sec,
      }

      return _refreshTime.value
    },
    set: (time) => {
      formData.value.defaultRefreshTime = (((time.hour + time.days * 24) * 60 + time.min) * 60 + time.sec) * 1000
      _refreshTime.value = time
    },
  })

  const resetRefreshTime = (options?: RefreshTimeObj) => {
    refreshTime.value = {
      days: options ? options.days : 0,
      hour: options ? options.hour : 0,
      min: options ? options.min : 0,
      sec: options ? options.sec : 0,
    }
  }

  const _refreshTimeOptionsIndex = ref(0)

  const refreshTimeOptionsIndex = computed({
    get: () => _refreshTimeOptionsIndex.value,
    set: (index) => {
      switch (index) {
        case 0 : resetRefreshTime(); break
        case 1 : resetRefreshTime({
          days: 1,
          hour: 0,
          min: 0,
          sec: 0,
        })
          break
        default : timeSelectDisabled.value = false
      }

      _refreshTimeOptionsIndex.value = index
    },
  })

  return { refreshTimeOptionsIndex, refreshTimeOptions, timeSelectDisabled, refreshTime, resetRefreshTime }
}
