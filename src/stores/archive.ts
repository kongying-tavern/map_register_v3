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

const logger = new Logger('[archive]')

/**
 * 存档管理
 */
export const useArchiveStore = defineStore('global-archive', {
  state: () => ({
    fetchLoading: false,
    archiveList: [] as API.ArchiveVo[],
    currentArchive: {
      Data_KYJG: [],
      Time_KYJG: {},
    } as Required<ArchiveBody>,
  }),

  actions: {
    /** 获取最新的存档列表 */
    async fetchArchive() {
      try {
        this.fetchLoading = true
        const { data = [] } = await Api.archive.getAllArchive({})
        this.archiveList = data
      }
      catch (err) {
        logger.error(err)
      }
      finally {
        this.fetchLoading = false
      }
    },

    /** 将当前存档存入新的存档槽位 */
    createArchive(name: string) {
      if (this.archiveList.length >= 5)
        throw new Error('存档数量最多为 5 个')
      return Api.archive.createArchive({
        slot_index: this.archiveList.length + 1,
        name,
      }, JSON.stringify(this.currentArchive))
    },

    /** 加载指定槽位的最新存档 */
    async loadArchive(slot_index: number) {
      const { data = {} } = await Api.archive.getLastArchive({ slot_index })
      const { archive = '{}' } = data
      const archiveData = JSON.parse(archive) as ArchiveBody
      const { Data_KYJG: points = [], Time_KYJG: times = {} } = archiveData
      this.currentArchive = { Data_KYJG: points, Time_KYJG: times }
    },
  },
})
