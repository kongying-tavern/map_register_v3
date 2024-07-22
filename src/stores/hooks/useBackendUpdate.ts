import type { Dexie, IndexableTypePart, Table } from 'dexie'
import type { Awaitable } from '@vueuse/core'
import { get } from 'lodash'
import { useFetchHook } from '@/hooks'
import { usePreferenceStore, useUserAuthStore } from '@/stores'
import { secondClock } from '@/shared'
import db from '@/database'
import { Logger } from '@/utils'

/** 默认更新间隔 30 分钟 */
const DEFAULT_UPDATE_GAP = 30 * 60 * 1000

const logger = new Logger('后台更新')

/** 判断是否为对象数组 */
const isObjectArray = (v: unknown[]): v is Record<string, unknown>[] => {
  const first = v[0]
  if (typeof first !== 'object' || first === null)
    return false
  return true
}

/** 通用后台更新 hook */
export const useBackendUpdate = <T, Key>(
  table: Dexie.Table<T, Key>,
  getDigestList: () => Awaitable<string[]>,
  getData: (digest: string) => Awaitable<T[]>,
) => {
  /** 轮询定时器 */
  const loopTimer = ref<number>()

  /** 是否正在等待下一次请求 */
  const isWatting = computed(() => loopTimer.value !== undefined)

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

  const { src } = table.schema.primKey

  /** 获取数组的主键范围 */
  const getRangeOfList = (data: T[]): DBType.DigestRange<number> | DBType.DigestRange<string> => {
    if (!isObjectArray(data))
      throw new Error('输入的格式有误，data 不为对象数组')
    if (!data.length)
      throw new Error('没有可更新的数据')

    const primaryValueList = data.map(item => get(item, src))
    const primaryValue = primaryValueList[0]
    let range: DBType.DigestRange<number> | DBType.DigestRange<string> | undefined

    const type = typeof primaryValue

    // 对于字符串主键使用 utf 编码进行排序，同 IndexedDB 对于字符串主键的默认排序方式
    if (type === 'string') {
      const collator = new Intl.Collator('en')
      primaryValueList.sort(collator.compare)
      range = [primaryValueList[0], primaryValueList[primaryValueList.length - 1]]
    }

    // 对于数值主键使用常规排序
    if (type === 'number') {
      primaryValueList.sort((a, b) => a - b)
      range = [primaryValueList[0], primaryValueList[primaryValueList.length - 1]]
    }

    if (!range)
      throw new Error(`表 ${table.name} 主键 ${src} 的值类型为 ${type}，暂不支持对其进行排序`)

    return range
  }

  const { data: lastUpdateCount, loading, refresh, onFinish, onSuccess, onError } = useFetchHook({
    onRequest: async (forceUpdate = false) => {
      startTime.value = Date.now()

      // 1. 获取新的摘要数组
      const digestCodeList = await getDigestList()
      const newDigestCodeSet = new Set(digestCodeList)

      // 2. 获取旧的摘要数组
      const oldDigestCollection = db.digest.where('tableName').equals(table.name)
      const oldDigestList = await oldDigestCollection.toArray()

      const oldDigestCodeList = oldDigestList.map(({ code }) => code)
      const oldDigestCodeSet = new Set(oldDigestCodeList)

      const isBalanced = oldDigestList.length === digestCodeList.length

      forceUpdate = !isBalanced

      let deleteCount = 0
      let updateCount = 0

      // 3. 计算要更新的摘要组
      const dataForUpdating: T[] = []
      const digestForUpdating: DBType.DigestInfo[] = []

      await Promise.all(digestCodeList
        .filter(oldDigest => forceUpdate || !oldDigestCodeSet.has(oldDigest))
        .map(async (code) => {
          try {
            const data = await getData(code)
            updateCount += data.length
            dataForUpdating.push(...data)
            digestForUpdating.push({
              code,
              range: getRangeOfList(data),
              tableName: table.name,
            })
          }
          catch (err) {
            throw new Error(`Get data error: ${err instanceof Error ? err.message : `${err}`}`)
          }
        }),
      )

      if (forceUpdate) {
        await (table as Table<T, IndexableTypePart>).clear()
        await table.bulkPut(dataForUpdating)
        await db.digest.where('tableName').equals(table.name).delete()
        await db.digest.bulkPut(digestForUpdating)
        return {
          deleteCount,
          updateCount,
        }
      }

      // 4. 计算要删除的摘要组
      const dataKeyForDelete: IndexableTypePart[] = []
      const digestCodeForDelete: string[] = []

      // 检测新旧摘要数量是否一致，不一致则清除全部的旧摘要
      for (const { code, range } of oldDigestList.filter(({ code }) => !newDigestCodeSet.has(code))) {
        table.where(src).inAnyRange([range], { includeUppers: true }).eachKey((key) => {
          dataKeyForDelete.push(key as IndexableTypePart)
          deleteCount++
        })
        digestCodeForDelete.push(code)
      }

      /**
       * @fixme 由于依赖 worker 代理大数据操作，主线程创建的数据库事务会被 worker 进行的数据库事务提前终止而导致异常
       * 因此这里暂时放弃事务
       */
      // await db.transaction('rw', table as Table<T, IndexableTypePart>, db.digest, async () => {
      await (table as Table<T, IndexableTypePart>).bulkDelete(dataKeyForDelete)
      await table.bulkPut(dataForUpdating)
      await db.digest.bulkDelete(digestCodeForDelete)
      await db.digest.bulkPut(digestForUpdating)
      // })

      return {
        deleteCount,
        updateCount,
      }
    },
  })

  const forceUpdate = () => refresh(true)

  const stop = () => {
    window.clearTimeout(loopTimer.value)
    loopTimer.value = undefined
  }

  /** alias */
  const start = refresh

  const getUpdateGap = () => {
    return usePreferenceStore().preference['database.setting.updateTimeGap'] || DEFAULT_UPDATE_GAP
  }

  onFinish(() => {
    stop()
    if (!useUserAuthStore().validateToken()) {
      loopTimer.value = undefined
      return
    }
    endTime.value = Date.now()
    const gap = getUpdateGap()
    nextTime.value = Date.now() + gap
    loopTimer.value = window.setTimeout(refresh, gap)
  })

  onSuccess(({ deleteCount, updateCount }) => {
    if (!deleteCount || !updateCount)
      return
    logger.info(`表 ${table.name} 删除了 ${deleteCount} 项，更新了 ${updateCount} 项。`)
  })

  onError((err) => {
    logger.error(err.message)
  })

  return {
    loading,
    lastUpdateCount,
    isWatting,
    costTime,
    restTime,
    refresh,
    forceUpdate,
    stop,
    start,
    onFinish,
    onSuccess,
    onError,
  }
}
