import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { liveQuery } from 'dexie'
import { messageFrom } from '@/utils'
import Api from '@/api/api'
import db from '@/database'
import { localSettings } from '@/stores'
import { secondClock } from '@/shared'

const loading = ref(false)
const updateTimer = ref<number>()
const updateEnd = ref<number>()
const total = ref(0)

liveQuery(() => db.icon.count()).subscribe((v) => {
  total.value = v
})

/** 本地图标数据 */
export const useIconStore = defineStore('global-icon', {
  state: () => ({
  }),

  getters: {
    total: () => total.value,
    /** 全量更新处理状态 */
    updateAllLoading: () => loading.value,
    /** 全量更新剩余时间 */
    updateAllRestTime: () => updateEnd.value === undefined ? 0 : updateEnd.value - secondClock.value,
  },

  actions: {
    /** 更新图标数据 */
    async updateIconInfo() {
      const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon({ current: 1, size: 0 })
        .then(res => res.data?.total ?? 0)
        .then(size => Api.icon.listIcon({ current: 1, size }))
      await db.icon.bulkPut(record)
      return total
    },

    /** 全量更新 */
    async updateAll() {
      const warn = ElNotification.warning({
        title: '正在更新图标数据...',
        duration: 0,
        position: 'bottom-right',
      })
      try {
        loading.value = true
        const startTime = dayjs()
        const total = await this.updateIconInfo()
        const spentTime = (dayjs().diff(startTime) / 1000).toFixed(0)
        ElNotification.success({
          title: '图标更新成功',
          message: `本次共更新图标 ${total} 个，耗时 ${spentTime} 秒`,
          position: 'bottom-right',
        })
      }
      catch (err) {
        ElNotification.error({
          title: '图标更新失败',
          message: messageFrom(err),
        })
      }
      finally {
        warn.close()
        loading.value = false
      }
    },

    /** 清除全部图标 */
    async clearAll() {
      try {
        loading.value = true
        await db.icon.clear()
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
