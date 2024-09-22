import { defineStore } from 'pinia'
import { userHook } from './hooks'
import Api from '@/api/api'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import type { UserPreference } from '@/stores/types/userPreference'
import { usePreferenceStore, useUserAuthStore } from '@/stores'

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

export interface ArchiveData extends API.SysArchiveVo {
  id?: number
  slotIndex?: number
  body: ArchiveBody
  timestamp: number
}

export interface ArchiveSlotData extends API.SysArchiveSlotVo {
  archiveList: ArchiveData[]
  timestamp: number
}

const parserArchive = ({ archive = '', time = '', ...rest }: API.SysArchiveVo): ArchiveData => {
  const { Data_KYJG: datas = [], Time_KYJG: times = {}, Preference: preference = {} } = JSON.parse(archive) as {
    Data_KYJG?: (string | number)[]
    Time_KYJG?: Record<number, string>
    Preference?: Partial<UserPreference>
  }
  return {
    ...rest,
    archive,
    time,
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
  body: {
    Data_KYJG: new Set(),
    Time_KYJG: {},
    Preference: {},
  },
  timestamp: new Date().getTime(),
})

/**
 * 存档管理
 * @todo 冗余操作太多，待优化
 */
export const useArchiveStore = defineStore('global-archive', () => {
  const userAuthStore = useUserAuthStore()

  const currentArchive = ref<ArchiveData>(initArchive())

  const hash = asyncComputed(async () => {
    const res = [...currentArchive.value.body.Data_KYJG.values()].join('')
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(res))
    return [...new Uint8Array(digest)].map(num => num.toString(16).padStart(2, '0').toUpperCase()).join('')
  }, '')

  const createArchiveBody = () => {
    return JSON.stringify({
      Data_KYJG: [...currentArchive.value.body.Data_KYJG],
      Time_KYJG: currentArchive.value.body.Time_KYJG,
      Preference: usePreferenceStore().preference,
    })
  }

  const { data: archiveSlots, loading: fetchLoading, refresh: fetchArchive } = useFetchHook({
    onRequest: async () => {
      const { data = [] } = await Api.archive.getAllHistoryArchive({})
      const slots = initArchiveList()
      data.forEach(({ archive: historyArchives = [], slotIndex = -1, updateTime, ...rest } = {}) => {
        const archive: ArchiveSlotData = {
          ...rest,
          updateTime,
          slotIndex,
          timestamp: (updateTime ? new Date(updateTime) : new Date()).getTime(),
          archiveList: historyArchives.map(parserArchive).sort(({ timestamp: a }, { timestamp: b }) => b - a),
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

  const loadArchive = (archiveData: ArchiveData, slotIndex = -1) => {
    currentArchive.value = archiveData
    currentArchive.value.slotIndex = slotIndex
    currentArchive.value.id = userAuthStore.auth.userId
  }

  /** 加载指定槽位的最新存档 */
  const loadArchiveSlot = (slotIndex = -1) => {
    if (slotIndex < 0)
      return
    const latestArchive = getLatestArchiveFromSlot(slotIndex)
    if (!latestArchive)
      return
    loadArchive(latestArchive, slotIndex)
  }

  /** 创建新的存档槽位并将当前存档存入 */
  const createArchiveSlot = async (name: string, slotIndex: number, saveCurrent = true) => {
    if (slotIndex < 0)
      throw new Error(`无效的存档槽位 ${slotIndex}`)
    if (slotIndex > 5)
      throw new Error('存档数量最多为 5 个')
    const body = saveCurrent
      ? createArchiveBody()
      : JSON.stringify({
        Data_KYJG: [],
        Time_KYJG: {},
        Preference: usePreferenceStore().preference,
      })
    await Api.archive.createSlotAndSaveArchive({ slot_index: slotIndex, name }, body)
  }

  /**
   * 将当前存档存入指定的存档槽位，
   * 如果没有存档，则存入本地数据库。
   */
  const saveArchiveToSlot = async (slotIndex = -1) => {
    if (slotIndex < 0) {
      const userId = userAuthStore.auth.userId
      if (userId === undefined)
        return
      const { body, timestamp } = currentArchive.value
      const data = {
        id: userId,
        body: {
          Data_KYJG: [...body.Data_KYJG],
          Time_KYJG: JSON.parse(JSON.stringify(body.Time_KYJG)),
        },
        timestamp,
      }
      await db.userArchive.put(data)
      return
    }
    await Api.archive.saveArchive({ slot_index: slotIndex }, createArchiveBody())
  }

  /** 删除指定槽位的存档 */
  const deleteArchiveSlot = async (slotIndex = -1) => {
    if (slotIndex < 0)
      return
    if (slotIndex === currentArchive.value.slotIndex)
      currentArchive.value.slotIndex = -1
    await Api.archive.removeArchive({ slot_index: slotIndex })
    await fetchArchive()
  }

  /** 加载指定槽位的历史存档 */
  const loadHistoryArchive = (slotIndex: number, historyIndex: number) => {
    if (slotIndex < 0)
      return
    const archiveSlot = archiveSlots.value[slotIndex]
    if (!archiveSlot)
      throw new Error(`槽位 ${slotIndex} 没有存档`)
    const historyArchive = archiveSlot.archiveList.find(history => history.historyIndex === historyIndex)
    if (!historyArchive)
      throw new Error(`历史存档 ${historyIndex} 为空`)
    loadArchive(historyArchive, slotIndex)
  }

  /**
   * 加载最新槽位的最新存档，
   * 如果没有存档，则读取本地数据库存档。
   */
  const loadLatestArchive = async () => {
    let latestArchive: ArchiveSlotData | undefined
    for (const slotIndex in archiveSlots.value) {
      const slotArchive = archiveSlots.value[slotIndex]
      if (!slotArchive)
        continue
      if (!latestArchive || slotArchive.timestamp > latestArchive.timestamp)
        latestArchive = slotArchive
    }
    if (!latestArchive) {
      const userId = userAuthStore.auth.userId
      if (userId === undefined)
        return
      const localArchive = await db.userArchive.get(userId)
      if (!localArchive)
        return
      const preference = await db.user.get(userId)
      const { id, body, timestamp } = localArchive
      loadArchive({
        id,
        body: {
          Data_KYJG: new Set(body.Data_KYJG),
          Time_KYJG: body.Time_KYJG,
          Preference: preference ?? {},
        },
        timestamp,
      })
      return
    }
    loadArchiveSlot(latestArchive.slotIndex)
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
  }
})

userHook.onInfoChange(useArchiveStore, async (store) => {
  store.currentArchive = initArchive()
  useUserAuthStore().validateToken() && await store.fetchArchive()
  await store.loadLatestArchive()
})
