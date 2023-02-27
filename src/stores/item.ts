import { defineStore } from 'pinia'
import type { AxiosRequestConfig } from 'axios'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { Archive, Logger, messageFrom } from '@/utils'
import Api from '@/api/api'
import db from '@/database'
import { localSettings } from '@/stores'
import { secondClock } from '@/shared'

const logger = new Logger('[itemStore]')
const localItemMD5 = useLocalStorage('local-item-md5', '')
const loading = ref(false)
const updateTimer = ref<number>()
const updateEnd = ref<number>()

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', {
  state: () => ({
    total: 0,
  }),

  getters: {
    /** 全量更新处理状态 */
    updateAllLoading: () => loading.value,
    /** 全量更新剩余时间 */
    updateAllRestTime: () => updateEnd.value === undefined ? 0 : updateEnd.value - secondClock.value,
  },

  actions: {
    /** 获取所有物品数据的 MD5 */
    async getItemMD5() {
      const { data = '' } = await Api.itemDoc.listAllItemBz2Md5()
      return data
    },

    /** 更新物品数据 */
    async updateItemInfo() {
      // 检查 MD5 是否有变化，如无则跳过更新
      const newMD5 = await this.getItemMD5()
      const oldMD5 = localItemMD5.value
      if (newMD5 === oldMD5)
        return 0
      const data = await Api.itemDoc.listAllItemBz2(({
        responseType: 'arraybuffer',
      } as AxiosRequestConfig)) as unknown as ArrayBuffer
      // 解压并更新物品数据至本地点位数据库
      const depressedData = await Archive.decompress(new Uint8Array(data))
      const stringData = new TextDecoder('utf-8').decode(depressedData.buffer)
      const parseredData = JSON.parse(stringData) as API.ItemVo[]
      await db.item.bulkPut(parseredData)
      // 物品信息成功之后才更新本地 MD5
      localItemMD5.value = newMD5
      return parseredData.length
    },

    /** 全量更新 */
    async updateAll() {
      try {
        loading.value = true
        const startTime = dayjs()
        const total = await this.updateItemInfo()
        this.total = await db.item.count()
        const spentTime = (dayjs().diff(startTime) / 1000).toFixed(0)
        ElNotification.success({
          title: '物品更新成功',
          message: `本次共更新物品 ${total} 个，耗时 ${spentTime} 秒`,
          position: 'bottom-right',
        })
      }
      catch (err) {
        ElNotification.error({
          title: '更新失败',
          message: messageFrom(err),
        })
      }
      finally {
        loading.value = false
      }
    },

    /** 清除后台定时任务 */
    clearBackgroundUpdate() {
      window.clearTimeout(updateTimer.value)
      updateTimer.value = undefined
    },

    /** 后台定时自动更新 */
    async backgroundUpdate() {
      if (updateTimer.value !== undefined) {
        logger.info('已建立 item 后台更新任务，将会重用')
        return
      }
      await this.updateAll()
      const interval = (localSettings.value.autoUpdateInterval ?? 20) * 60000
      updateEnd.value = new Date().getTime() + interval
      updateTimer.value = window.setTimeout(() => {
        updateTimer.value = undefined
        this.backgroundUpdate()
      }, interval)
    },
  },
})
