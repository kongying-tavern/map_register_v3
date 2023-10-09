import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { liveQuery } from 'dexie'
import { messageFrom } from '@/utils'
import Api from '@/api/api'
import db, { AppDatabaseApi } from '@/database'
import { localSettings } from '@/stores'
import { secondClock } from '@/shared'

const loading = ref(false)
const updateTimer = ref<number>()
const updateEnd = ref<number>()
const total = ref(0)

/** 本地地区数据 */
export const useAreaStore = defineStore('global-area', {
  state: () => ({
    _areaList: [] as API.AreaVo[],
  }),

  getters: {
    total: () => total.value,
    areaMap: state => (Object.fromEntries(state._areaList.map(area => [
      area.id as number,
      area,
    ]))) as Record<string, API.AreaVo>,
    areaCodeMap: state => Object.fromEntries(state._areaList.map(area => [
      area.code!,
      area,
    ])) as Record<string, API.AreaVo>,
    /** 全量更新处理状态 */
    updateAllLoading: () => loading.value,
    /** 全量更新剩余时间 */
    updateAllRestTime: () => updateEnd.value === undefined ? 0 : updateEnd.value - secondClock.value,
  },

  actions: {
    /** 更新地区数据 */
    async updateAreaInfo() {
      const { data = [] } = await Api.area.listArea({}, {
        isTraverse: true,
        parentId: -1,
      })
      await db.area.clear()
      await AppDatabaseApi.area.bulkPut(data)
      return data.length
    },

    /** 全量更新 */
    async updateAll() {
      try {
        loading.value = true
        const startTime = dayjs()
        const total = await this.updateAreaInfo()
        const spentTime = (dayjs().diff(startTime) / 1000).toFixed(0)
        localSettings.value.noticeDataUpdated && ElNotification.success({
          title: !total ? '地区已经是最新' : '地区更新成功',
          message: !total ? undefined : `本次共更新地区 ${total} 个，耗时 ${spentTime} 秒`,
          position: 'bottom-right',
        })
      }
      catch (err) {
        ElNotification.error({
          title: '地区更新失败',
          message: messageFrom(err),
          position: 'bottom-right',
        })
      }
      finally {
        loading.value = false
      }
    },

    /** 清除全部地区 */
    async clearAll() {
      try {
        loading.value = true
        await db.area.clear()
      }
      catch {
        // no action
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
      if (updateTimer.value !== undefined)
        this.clearBackgroundUpdate()
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

liveQuery(() => db.area.toArray()).subscribe((areaList) => {
  total.value = areaList.length
  useAreaStore()._areaList = areaList
})
