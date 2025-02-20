import { DATA_START_TIME } from '@/shared/constant'

export const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const now = Date.now()
      return [now - 7 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '最近一月',
    value: () => {
      const now = Date.now()
      return [now - 30 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '最近一年',
    value: () => {
      const now = Date.now()
      return [now - 365 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '全部',
    value: () => {
      const now = Date.now()
      return [DATA_START_TIME, now]
    },
  },
]

export const disabledDate = (date: Date) => {
  const dateTime = date.getTime()
  const now = Date.now()
  return dateTime < DATA_START_TIME || dateTime > now
}
