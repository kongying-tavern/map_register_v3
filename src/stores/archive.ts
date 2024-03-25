import { defineStore } from 'pinia'
import { userHook } from './hooks'
import Api from '@/api/api'
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

/**
 * 存档管理
 * @todo 冗余操作太多，待优化
 */
export const useArchiveStore = defineStore('global-archive', () => {
  const currentArchive = ref<ArchiveData>({
    body: {
      Data_KYJG: new Set(),
      Time_KYJG: {},
      Preference: {},
    },
    timestamp: new Date().getTime(),
  })

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

  /** 加载指定槽位的最新存档 */
  const loadArchiveSlot = (slotIndex = -1) => {
    if (slotIndex < 0)
      return
    const latestArchive = getLatestArchiveFromSlot(slotIndex)
    if (!latestArchive)
      return
    currentArchive.value = latestArchive
    currentArchive.value.slotIndex = slotIndex
  }

  /** 创建新的存档槽位并将当前存档存入 */
  const createArchiveSlot = async (name: string, slotIndex: number) => {
    if (slotIndex > 5)
      throw new Error('存档数量最多为 5 个')
    await Api.archive.createSlotAndSaveArchive({ slot_index: slotIndex, name }, createArchiveBody())
  }

  /** 将当前存档存入指定的存档槽位 */
  const saveArchiveToSlot = async (slotIndex = -1) => {
    if (slotIndex < 0)
      return
    await Api.archive.saveArchive({ slot_index: slotIndex }, createArchiveBody())
  }

  /** 删除指定槽位的存档 */
  const deleteArchiveSlot = async (slotIndex = -1) => {
    if (slotIndex < 0)
      return
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
    const findHistory = archiveSlot.archiveList.find(history => history.historyIndex === historyIndex)
    if (!findHistory)
      throw new Error(`历史存档 ${historyIndex} 为空`)
    currentArchive.value = findHistory
    currentArchive.value.slotIndex = slotIndex
  }

  /** 加载最新槽位的最新存档 */
  const loadLatestArchive = () => {
    let latestSlotIndex: ArchiveSlotData | undefined
    for (const slotIndex in archiveSlots.value) {
      const archiveSlot = archiveSlots.value[slotIndex]
      if (!archiveSlot)
        continue
      if (!latestSlotIndex || archiveSlot.timestamp > latestSlotIndex.timestamp)
        latestSlotIndex = archiveSlot
    }
    if (!latestSlotIndex)
      return
    loadArchiveSlot(latestSlotIndex.slotIndex)
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
  useUserAuthStore().validateToken() && await store.fetchArchive()
  store.loadLatestArchive()
})
