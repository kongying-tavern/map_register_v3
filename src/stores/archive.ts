import { defineStore } from 'pinia'
import Api from '@/api/api'
import { Logger } from '@/utils'

export interface ArchiveBody {
  /** 点位存档 */
  Data_KYJG: number[]
  /**
   * 刷新时间存档
   * @format `YYYY/MM/DD HH:mm:ss`
   */
  Time_KYJG: Record<number, string>
}

export interface ArchiveData extends API.ArchiveVo {
  body: ArchiveBody
  timestamp: number
}

export interface ArchiveSlotData extends API.ArchiveSlotVo {
  archiveList: ArchiveData[]
}

const logger = new Logger('[archive]')

const parserArchive = ({ archive = '', time = '', ...rest }: API.ArchiveVo): ArchiveData => {
  const { Data_KYJG: datas = [], Time_KYJG: times = {} } = JSON.parse(archive) as {
    Data_KYJG?: (string | number)[]
    Time_KYJG?: Record<number, string>
  }
  return {
    ...rest,
    archive,
    time,
    body: {
      Data_KYJG: datas.map(Number),
      Time_KYJG: times,
    },
    timestamp: new Date(time).getTime(),
  }
}

/**
 * 存档管理
 */
export const useArchiveStore = defineStore('global-archive', {
  state: () => ({
    fetchLoading: false,
    archiveSlots: {} as Record<number, ArchiveSlotData | undefined>,
    currentArchive: {
      body: {
        Data_KYJG: [],
        Time_KYJG: [],
      },
      timestamp: new Date().getTime(),
    } as ArchiveData,
  }),

  actions: {
    /** 获取最新的存档列表 */
    async fetchArchive() {
      try {
        this.fetchLoading = true
        const { data = [] } = await Api.archive.getAllHistoryArchive({})
        const archiveSlots: Record<number, ArchiveSlotData | undefined> = Object.fromEntries(
          new Array(5).fill([]).map((_, index) => [index + 1, undefined]),
        )
        data.forEach(({ archive: historyArchives = [], slotIndex = -1, ...rest } = {}) => {
          const archive = {
            ...rest,
            slotIndex,
            archiveList: historyArchives.map(parserArchive).sort(({ timestamp: a }, { timestamp: b }) => b - a),
          }
          archiveSlots[slotIndex] = archive
        })
        this.archiveSlots = archiveSlots
      }
      catch (err) {
        logger.error(err)
      }
      finally {
        this.fetchLoading = false
      }
    },

    /** 创建新的存档槽位并将当前存档存入 */
    async createArchiveSlot(name: string, slot_index: number) {
      if (slot_index > 5)
        throw new Error('存档数量最多为 5 个')
      const { body = {} } = this.currentArchive ?? {}
      await Api.archive.createSlotAndSaveArchive({ slot_index, name }, JSON.stringify(body))
    },

    /** 将当前存档存入指定的存档槽位 */
    async saveArchiveToSlot(slot_index = -1) {
      const { body } = this.currentArchive
      await Api.archive.saveArchive({ slot_index }, JSON.stringify(body))
    },

    /** 删除指定槽位的存档 */
    async deleteArchiveSlot(slot_index = -1) {
      await Api.archive.removeArchive({ slot_index })
      await this.fetchArchive()
    },

    /** 获取指定槽位的最新存档 */
    getLatestArchiveFromSlot(slot_index = -1) {
      const archiveSlot = this.archiveSlots[slot_index]
      if (!archiveSlot)
        throw new Error(`槽位 ${slot_index} 没有存档`)
      const { archiveList } = archiveSlot
      return archiveList[0]
    },

    /** 加载指定槽位的最新存档 */
    loadArchiveSlot(slot_index = -1) {
      this.currentArchive = this.getLatestArchiveFromSlot(slot_index)
    },

    /** 加载指定槽位的历史存档 */
    loadHistoryArchive(slot_index: number, history_index: number) {
      const archiveSlot = this.archiveSlots[slot_index]
      if (!archiveSlot)
        throw new Error(`槽位 ${slot_index} 没有存档`)
      const { archiveList } = archiveSlot
      if (!(history_index in archiveList))
        throw new Error(`历史存档 ${history_index} 为空`)
      this.currentArchive = archiveList[history_index]
    },
  },
})
