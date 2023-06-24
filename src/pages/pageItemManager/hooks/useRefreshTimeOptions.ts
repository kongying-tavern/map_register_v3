export interface WithRefreshTimeForm {
  defaultRefreshTime?: number
}

export interface RefreshHookOptions {
  /**
   * 选择自定义刷新类型后默认给出的刷新时间 (ms)
   * @default 259_200_000
   */
  customRefreshTime?: number
}

const assert = (msg: string, condition: () => boolean) => {
  if (!condition())
    throw new Error(msg)
}

export const useRefreshTimeOptions = (form: Ref<WithRefreshTimeForm | undefined>, options: RefreshHookOptions = {}) => {
  const { customRefreshTime = 259_200_000 } = options

  assert(`自定义的刷新时间{${customRefreshTime}}不能与不刷新或次日的时间相同`, () => ![0, 86_400_000].includes(customRefreshTime))

  const REFRESH_TYPE_MAP = {
    NO_REFRESH: { label: '不刷新', time: 0 },
    NEXT_DAY: { label: '次日', time: 86_400_000 },
    CUSTOM: { label: '自定义', time: customRefreshTime },
  } as const

  const refreshTimeOptions = Object
    .entries(REFRESH_TYPE_MAP)
    .map(([value, { label }]) => ({ label, value }))

  const defaultRefreshTime = computed({
    get: () => form.value?.defaultRefreshTime ?? 0,
    set: (v) => {
      if (!form.value)
        form.value = {}
      form.value.defaultRefreshTime = v
    },
  })

  const getRefreshType = (time: number) => (({
    0: 'NO_REFRESH',
    86_400_000: 'NEXT_DAY',
  })[time] ?? 'CUSTOM') as keyof typeof REFRESH_TYPE_MAP

  const refreshType = computed({
    get: () => getRefreshType(defaultRefreshTime.value),
    set: (v) => {
      defaultRefreshTime.value = REFRESH_TYPE_MAP[v].time
    },
  })

  const customEditorDisabled = computed(() => refreshType.value !== 'CUSTOM')

  return { refreshTimeOptions, customEditorDisabled, refreshType, REFRESH_TYPE_MAP, getRefreshType }
}
