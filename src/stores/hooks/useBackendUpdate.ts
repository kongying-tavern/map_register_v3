import type { Dexie } from 'dexie'
import type { Awaitable } from '@vueuse/core'
import { get } from 'lodash'
import { useFetchHook } from '@/hooks'
import { usePreferenceStore } from '@/stores'
import { secondClock } from '@/shared'
import db from '@/database'
import type { DigestRange } from '@/database/appdatabase'
import { Logger } from '@/utils'

/** 默认更新间隔 30 分钟 */
const DEFAULT_UPDATE_GAP = 30 * 60 * 1000

export interface BackendUpdatePayload<T> {
  digestList: string[]
  dataList: T[][]
}

const logger = new Logger('[后台更新]')

export const useBackendUpdate = <T, Key>(table: Dexie.Table<T, Key>, request: () => Awaitable<BackendUpdatePayload<T>>) => {
  const timerId = ref<number>()

  const isWatting = computed(() => timerId.value !== undefined)

  /** 上一次更新开始的时间戳 */
  const startTime = ref(Date.now())

  /** 上一次更新结束的时间戳 */
  const endTime = ref(Date.now())

  /** 上一次更新花费的时间 */
  const costTime = computed(() => endTime.value - startTime.value)

  /** 下一次更新的时间戳 */
  const nextTime = ref<number>()

  /** 距离下次更新需要的时间 */
  const restTime = computed(() => !nextTime.value ? 0 : nextTime.value - secondClock.value)

  const isObjectArray = (v: unknown[]): v is Record<string, unknown>[] => {
    const first = v[0]
    if (typeof first !== 'object' || first === null)
      return false
    return true
  }

  const getRangeOfList = (data: T[]): DigestRange<number> | DigestRange<string> => {
    if (!isObjectArray(data))
      throw new Error('输入的格式有误，data 不为对象数组')
    const primaryValueList = data.map(item => get(item, table.schema.primKey.src))
    const primaryValue = primaryValueList[0]
    let range: DigestRange<number> | DigestRange<string> | undefined
    if (typeof primaryValue === 'string') {
      const collator = new Intl.Collator('en')
      primaryValueList.sort(collator.compare)
      range = [primaryValueList[0], primaryValueList[primaryValueList.length - 1]]
    }
    if (typeof primaryValue === 'number') {
      primaryValueList.sort((a, b) => a - b)
      range = [primaryValueList[0], primaryValueList[primaryValueList.length - 1]]
    }
    if (!range)
      throw new Error('无法对 string 或 number 类型以外的主键进行排序')
    return range
  }

  const compare = (a: string | number, b: string | number) => {
    let result: number | undefined
    if (typeof a === 'string' && typeof b === 'string')
      result = new Intl.Collator('en').compare(a, b)
    if (typeof a === 'number' && typeof b === 'number')
      result = a - b
    if (!result)
      throw new Error('无法对比两值，类型不一致')
    return result > 0
      ? { min: b, max: a }
      : { min: a, max: b }
  }

  const { refresh, onFinish, ...rest } = useFetchHook({
    onRequest: async () => {
      startTime.value = Date.now()
      const { digestList, dataList } = await request()

      // 检查数量是否一致
      if (digestList.length !== dataList.length)
        throw new Error('摘要数组与数据数组的数量不一致')

      logger.info(`表 ${table.name} 信息`, { table, digestList, dataList })

      // 检查合并摘要不同的数据
      const updateCounts = await Promise.all(digestList.map(async (newDigestCode, index) => {
        const data = dataList[index]
        const newRange = getRangeOfList(data)

        const oldDigest = await db.digest
          .where('tableName')
          .equals(table.name)
          .and(d => d.index === index)
          .first()

        if (!oldDigest || oldDigest.code !== newDigestCode) {
          let rewriteRange: DigestRange<number> | DigestRange<string> | undefined
          if (oldDigest) {
            const { range: oldRange } = oldDigest
            rewriteRange = [
              compare(oldRange[0], newRange[0]).min,
              compare(oldRange[1], newRange[1]).max,
            ] as DigestRange<number> | DigestRange<string>
          }
          const range = rewriteRange ?? newRange
          await db.transaction('rw', table as Dexie.Table, async () => {
            await table
              .where(table.schema.primKey.src)
              .inAnyRange([range])
              .delete()
            await table.bulkPut(data)
          })
          await db.digest.put({
            code: newDigestCode,
            index,
            range,
            tableName: table.name,
          })
          return data.length
        }

        return 0
      }))

      const sum = updateCounts.reduce((sum, cur) => sum + cur, 0)
      logger.info(`表 ${table.name} 累计更新${sum} 项`)
      return sum
    },
  })

  const stop = () => {
    window.clearTimeout(timerId.value)
    timerId.value = undefined
  }

  /** alias */
  const start = refresh

  const getUpdateGap = () => {
    return usePreferenceStore().preference['database.setting.updateTimeGap'] || DEFAULT_UPDATE_GAP
  }

  onFinish(() => {
    stop()
    endTime.value = Date.now()
    const gap = getUpdateGap()
    nextTime.value = Date.now() + gap
    timerId.value = window.setTimeout(refresh, gap)
  })

  return {
    isWatting,
    costTime,
    restTime,
    refresh,
    stop,
    start,
    onFinish,
    ...rest,
  }
}
