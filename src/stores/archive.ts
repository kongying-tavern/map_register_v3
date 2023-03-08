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
  Time_KYJG: {
    [key: string]: string
  }
}

export interface ArchiveData extends API.ArchiveVo {
  body?: ArchiveBody
}

const logger = new Logger('[archive]')

/**
 * 存档管理
 */
export const useArchiveStore = defineStore('global-archive', {
  state: () => ({
    fetchLoading: false,
    archiveList: [] as ArchiveData[],
    currentArchive: {
      body: { Data_KYJG: [1] },
    } as ArchiveData,
  }),

  actions: {
    ensureArchive(slot_index: number) {
      if (!(slot_index in this.archiveList))
        throw new Error(`槽位 ${slot_index} 没有存档`)
    },

    /** 获取最新的存档列表 */
    async fetchArchive() {
      try {
        this.fetchLoading = true
        const { data = [] } = await Api.archive.getAllArchive({})
        this.archiveList = data.map(archive => ({ ...archive, body: JSON.parse(archive.archive ?? '{}') }))
      }
      catch (err) {
        logger.error(err)
      }
      finally {
        this.fetchLoading = false
      }
    },

    /** 创建新的存档槽位并将当前存档存入 */
    async createArchive(name: string, slot_index: number) {
      if (this.archiveList.length >= 5)
        throw new Error('存档数量最多为 5 个')
      const { body = {} } = this.currentArchive ?? {}
      await Api.archive.createArchive({ slot_index, name }, JSON.stringify(body))
    },

    /** 将当前存档存入指定的存档槽位 */
    async saveArchive(slot_index = -1) {
      this.ensureArchive(slot_index)
      await Api.archive.saveArchive({ slot_index }, JSON.stringify(this.currentArchive.body ?? {}))
    },

    /** 删除指定槽位的存档 */
    async deleteArchive(slot_index = -1) {
      this.ensureArchive(slot_index)
      await Api.archive.removeArchive({ slot_index })
      await this.fetchArchive()
    },

    /** 加载指定槽位的最新存档 */
    loadArchive(slot_index = -1) {
      this.ensureArchive(slot_index)
      this.currentArchive = this.archiveList[slot_index]
    },
  },
})
