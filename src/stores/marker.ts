import { defineStore } from 'pinia'
import type { AxiosRequestConfig } from 'axios'
import { ElLoading, ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { Archive, messageFrom } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', {
  state: () => ({
  }),

  actions: {
    /** 获取点位分页数据的 MD5 数组 */
    async getMarkerMD5List() {
      const { data = [] } = await Api.markerDoc.listMarkerBz2MD5()
      return data
    },

    /** 更新分页点位数据 */
    async updateMarkerInfo(index: number, newMD5: string) {
      // 检查 MD5 是否有变化，如无则跳过更新
      const oldMD5 = (await db.markerMD5.get(index))?.md5
      if (newMD5 === oldMD5)
        return 0
      const data = await Api.markerDoc.listPageMarkerBy7zip({ index }, ({
        responseType: 'arraybuffer',
      } as AxiosRequestConfig)) as unknown as ArrayBuffer
      await db.markerMD5.put({ index, md5: newMD5 }, index)
      // 解压并更新点位数据至本地点位数据库
      const depressedData = await Archive.decompress(new Uint8Array(data))
      const stringData = new TextDecoder('utf-8').decode(depressedData.buffer)
      // 将 itemList 拆解出物品 id 数组以便创建索引
      const parseredData = (JSON.parse(stringData) as API.MarkerVo[])
        .map(({ itemList, ...rest }) => ({ ...rest, itemList, itemIdList: itemList?.map(item => item.itemId) }))
      await db.marker.bulkPut(parseredData)
      return parseredData.length
    },

    /** 全量更新 */
    async updateAll() {
      const loadingInstance = ElLoading.service({
        fullscreen: true,
        text: '正在更新点位信息...',
        background: 'rgb(0 0 0 / 0.3)',
      })
      ElNotification.closeAll()
      try {
        const startTime = dayjs()
        const md5List = await this.getMarkerMD5List()
        const updatedCountList = await Promise.all(md5List.map((_, index) => this.updateMarkerInfo(index + 1, md5List[index])))
        const total = updatedCountList.reduce((sum, num) => sum + num, 0)
        ElNotification.success({
          title: '更新成功',
          message: `本次共更新点位 ${total} 个，耗时 ${(dayjs().diff(startTime) / 1000).toFixed(0)} 秒`,
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
