import { defineStore } from 'pinia'
import type { AxiosRequestConfig } from 'axios'
import { ElLoading, ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { Archive, messageFrom } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

const localItemMD5 = useLocalStorage('local-item-md5', '')

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', {
  state: () => ({
  }),

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
      const loadingInstance = ElLoading.service({
        fullscreen: true,
        text: '正在更新点位信息...',
        background: 'rgb(0 0 0 / 0.3)',
      })
      try {
        const startTime = dayjs()
        const total = await this.updateItemInfo()
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
        loadingInstance.close()
      }
    },
  },
})
