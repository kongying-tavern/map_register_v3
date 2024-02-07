import { defineStore } from 'pinia'
import { userHook } from './hooks'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserAuthStore } from '@/stores'

export interface ArchiveBody {
  /** 点位存档 */
  Data_KYJG: Set<number>
  /**
   * 刷新时间存档
   * @format `YYYY/MM/DD HH:mm:ss`
   */
  Time_KYJG: Record<number, string>
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
  const { Data_KYJG: datas = [], Time_KYJG: times = {} } = JSON.parse(archive) as {
    Data_KYJG?: (string | number)[]
    Time_KYJG?: Record<number, string>
  }
  return {
    ...rest,
    archive,
    time,
    body: {
      Data_KYJG: new Set(datas.map(Number)),
      Time_KYJG: times,
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
    },
    timestamp: new Date().getTime(),
  })

  const hash = asyncComputed(async () => {
    const res = [...currentArchive.value.body.Data_KYJG.values()].join('')
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(res))
    return [...new Uint8Array(digest)].map(num => num.toString(16).padStart(2, '0').toUpperCase()).join('')
  }, '')

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

  /** 创建新的存档槽位并将当前存档存入 */
  const createArchiveSlot = async (name: string, slot_index: number) => {
    if (slot_index > 5)
      throw new Error('存档数量最多为 5 个')
    await Api.archive.createSlotAndSaveArchive({ slot_index, name }, JSON.stringify({
      Data_KYJG: [...currentArchive.value.body.Data_KYJG],
      Time_KYJG: currentArchive.value.body.Time_KYJG,
    }))
  }

  /** 将当前存档存入指定的存档槽位 */
  const saveArchiveToSlot = async (slot_index = -1) => {
    const archive = JSON.stringify({
      Data_KYJG: [...currentArchive.value.body.Data_KYJG],
      Time_KYJG: currentArchive.value.body.Time_KYJG,
    })
    await Api.archive.saveArchive({ slot_index }, archive)
  }

  /** 删除指定槽位的存档 */
  const deleteArchiveSlot = async (slot_index = -1) => {
    await Api.archive.removeArchive({ slot_index })
    await fetchArchive()
  }

  /** 获取指定槽位的最新存档 */
  const getLatestArchiveFromSlot = (slot_index = -1) => {
    const archiveSlot = archiveSlots.value[slot_index]
    if (!archiveSlot)
      throw new Error(`槽位 ${slot_index} 没有存档`)
    const { archiveList } = archiveSlot
    return archiveList[0]
  }

  /** 加载指定槽位的最新存档 */
  const loadArchiveSlot = (slot_index = -1) => {
    currentArchive.value = getLatestArchiveFromSlot(slot_index)
    currentArchive.value.slotIndex = slot_index
  }

  /** 加载指定槽位的历史存档 */
  const loadHistoryArchive = (slotIndex: number, historyIndex: number) => {
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
