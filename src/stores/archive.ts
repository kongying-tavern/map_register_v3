import { defineStore } from 'pinia'
import { getDefaultPreference } from './types'
import Api from '@/api/api'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import type { UserPreference } from '@/stores/types/userPreference'
import { useUserAuthStore } from '@/stores'

export interface ArchiveBody {
  /** 点位存档 */
  Data_KYJG: Set<number>
  /**
   * 刷新时间存档
   * @format `YYYY/MM/DD HH:mm:ss`
   */
  Time_KYJG: Record<number, string>
  /** 用户首选项 */
  Preference: Partial<UserPreference>
}

export interface ArchiveData {
  id: number
  slotIndex: number
  body: ArchiveBody
  timestamp: number
}

export interface ArchiveSlotData extends API.SysArchiveSlotVo {
  archiveList: ArchiveData[]
  timestamp: number
}

const parserArchive = ({ archive = '', time = '' }: API.SysArchiveVo, options: { slotIndex: number; userId: number }): ArchiveData => {
  const { Data_KYJG: datas = [], Time_KYJG: times = {}, Preference: preference = {} } = JSON.parse(archive) as {
    Data_KYJG?: (string | number)[]
    Time_KYJG?: Record<number, string>
    Preference?: Partial<UserPreference>
  }
  return {
    id: options.userId,
    slotIndex: options.slotIndex,
    body: {
      Data_KYJG: new Set(datas.map(Number)),
      Time_KYJG: times,
      Preference: preference,
    },
    timestamp: new Date(time).getTime(),
  }
}

const initArchiveList = (): Record<number, ArchiveSlotData | undefined> => Object.fromEntries(
  Array.from({ length: 5 }).map((_, index) => [index + 1, undefined]),
)

const initArchive = (): ArchiveData => ({
  id: -1,
  slotIndex: -1,
  body: {
    Data_KYJG: new Set(),
    Time_KYJG: {},
    Preference: getDefaultPreference(),
  },
  timestamp: new Date().getTime(),
})

/** 存档管理 */
export const useArchiveStore = defineStore('global-archive', () => {
  const userAuthStore = useUserAuthStore()

  const currentArchive = ref<ArchiveData>(initArchive())

  const hash = asyncComputed(async () => {
    const res = [...currentArchive.value.body.Data_KYJG.values()].join('')
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(res))
    return [...new Uint8Array(digest)].map(num => num.toString(16).padStart(2, '0').toUpperCase()).join('')
  }, '')

  const getJSONArchive = () => JSON.stringify({
    Data_KYJG: [...currentArchive.value.body.Data_KYJG],
    Time_KYJG: currentArchive.value.body.Time_KYJG,
    Preference: currentArchive.value.body.Preference,
  })

  const { data: archiveSlots, loading: fetchLoading, refresh: fetchArchive } = useFetchHook({
    onRequest: async () => {
      const slots = initArchiveList()
      if (!userAuthStore.validateToken())
        return slots
      const { data = [] } = await Api.archive.getAllHistoryArchive({})
      data.forEach(({ archive: historyArchives = [], slotIndex = -1, updateTime, ...rest } = {}) => {
        const archive: ArchiveSlotData = {
          ...rest,
          updateTime,
          slotIndex,
          timestamp: (updateTime ? new Date(updateTime) : new Date()).getTime(),
          archiveList: historyArchives
            .map(body => parserArchive(body, { slotIndex, userId: userAuthStore.auth.userId! }))
            .sort(({ timestamp: a }, { timestamp: b }) => b - a),
        }
        slots[slotIndex] = archive
      })
      return slots
    },
  })

  /** 获取指定槽位的最新存档 */
  const getLatestArchiveFromSlot = (slotIndex = -1) => {
    const archiveSlot = archiveSlots.value[slotIndex]
    if (!archiveSlot)
      throw new Error(`槽位 ${slotIndex} 没有存档`)
    const { archiveList } = archiveSlot
    return archiveList[0]
  }

  const loadArchive = (archiveData: ArchiveData) => {
    currentArchive.value = archiveData
  }

  /** 加载指定槽位的最新存档 */
  const loadArchiveSlot = (slotIndex = -1) => {
    if (slotIndex < 0)
      return
    const latestArchive = getLatestArchiveFromSlot(slotIndex)
    if (!latestArchive)
      return
    loadArchive(latestArchive)
  }

  /**
   * 创建新的存档槽位
   * - `saveCurrent` 同时保存当前应用状态为存档
   */
  const createArchiveSlot = async (
    name: string,
    slotIndex: number,
    saveCurrent = true,
  ) => {
    if (slotIndex < 0 || slotIndex >= 5)
      throw new Error(`无效的存档槽位 ${slotIndex}`)
    const body = saveCurrent
      ? getJSONArchive()
      : JSON.stringify({ Data_KYJG: [], Time_KYJG: {}, Preference: {} })
    await Api.archive.createSlotAndSaveArchive({ slot_index: slotIndex, name }, body)
  }

  /** 将当前存档存入指定的存档槽位 */
  const saveArchiveToSlot = async (slotIndex = -1) => {
    if (!userAuthStore.validateToken())
      return
    // 同时存入本地数据库
    const { body, timestamp } = currentArchive.value
    await db.userArchive.put({
      id: userAuthStore.auth.userId!,
      body: JSON.parse(JSON.stringify({
        Data_KYJG: [...body.Data_KYJG],
        Time_KYJG: body.Time_KYJG,
        Preference: body.Preference,
      })),
      timestamp,
    })
    if (slotIndex > 0 && slotIndex <= 5)
      await Api.archive.saveArchive({ slot_index: slotIndex }, getJSONArchive())
  }

  watch(currentArchive, arcihve => saveArchiveToSlot(arcihve.slotIndex), { deep: true, immediate: true })

  /** 删除指定槽位的存档 */
  const deleteArchiveSlot = async (slotIndex = -1) => {
    if (slotIndex < 0 || !userAuthStore.validateToken())
      return
    if (slotIndex === currentArchive.value.slotIndex)
      currentArchive.value.slotIndex = -1
    await Api.archive.removeArchive({ slot_index: slotIndex })
    await fetchArchive()
  }

  /** 加载指定槽位的历史存档 */
  const loadHistoryArchive = (slotIndex: number, timestamp: number) => {
    if (slotIndex < 0)
      return
    const archiveSlot = archiveSlots.value[slotIndex]
    if (!archiveSlot)
      throw new Error(`槽位 ${slotIndex} 没有存档`)
    const historyArchive = archiveSlot.archiveList.find(history => history.timestamp === timestamp)
    if (!historyArchive)
      throw new Error(`时间为 ${new Date(timestamp).toLocaleString()} 的存档历史为空`)
    loadArchive(historyArchive)
  }

  /** 加载最新槽位的最新存档 */
  const loadLatestArchive = async () => {
    let latestArchive: ArchiveSlotData | undefined

    for (const slotIndex in archiveSlots.value) {
      const slotArchive = archiveSlots.value[slotIndex]
      if (!slotArchive)
        continue
      if (!latestArchive || slotArchive.timestamp > latestArchive.timestamp)
        latestArchive = slotArchive
    }

    const userId = userAuthStore.auth.userId
    if (userId === undefined)
      return

    // 如果没有存档，则读取本地数据库存档。
    if (!latestArchive) {
      const localArchive = await db.userArchive.get(userId)
      if (!localArchive)
        return
      const preference = await db.user.get(userId)
      const { id, body, timestamp } = localArchive
      loadArchive({
        id,
        slotIndex: -1,
        body: {
          Data_KYJG: new Set(body.Data_KYJG),
          Time_KYJG: body.Time_KYJG,
          Preference: preference ?? getDefaultPreference(),
        },
        timestamp,
      })
      return
    }

    if (!latestArchive)
      return

    loadArchiveSlot(latestArchive.slotIndex)
  }

  watch(() => userAuthStore.auth.userId, async () => {
    await fetchArchive()
    await loadLatestArchive()
  })

  const init = async () => {
    await fetchArchive()
    await loadLatestArchive()
  }

  return {
    currentArchive,
    hash,
    fetchLoading,
    archiveSlots,

    fetchArchive,
    createArchiveSlot,
    saveArchiveToSlot,
    deleteArchiveSlot,
    loadArchiveSlot,
    loadHistoryArchive,
    loadLatestArchive,
    init,
  }
})
