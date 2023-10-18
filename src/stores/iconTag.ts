import { defineStore } from 'pinia'
import type { AxiosRequestConfig } from 'axios'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { liveQuery } from 'dexie'
import { Zip, messageFrom } from '@/utils'
import Api from '@/api/api'
import db, { AppDatabaseApi } from '@/database'
import { localSettings } from '@/stores'
import { secondClock } from '@/shared'

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
  const _iconList = shallowRef<API.TagVo[]>([])
  const _total = ref(0)
  const _loading = ref(false)
  const _updateTimer = ref<number>()
  const _updateEnd = ref<number>()

  const total = computed(() => _total.value)

  const iconTagMap = computed(() => Object.fromEntries(_iconList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)

  /** 全量更新处理状态 */
  const updateAllLoading = computed(() => _loading.value)

  /** 全量更新剩余时间 */
  const updateAllRestTime = computed(() => _updateEnd.value === undefined ? 0 : _updateEnd.value - secondClock.value)

  /** 获取图标标签数据最新的 MD5 */
  const getIconTagMD5 = async () => {
    const { data = '' } = await Api.tagDoc.listAllTagBz2Md5()
    return data
  }

  const resetMD5 = async () => {
    await db.md5.delete('iconTag-0')
  }

  /** 获取解析后的图标标签数据 */
  const getIconTagData = async () => {
    const data = await Api.tagDoc.listAllTagBz2({
      responseType: 'arraybuffer',
    } as AxiosRequestConfig) as unknown as ArrayBuffer
    const depressedData = await Zip.decompress(new Uint8Array(data))
    const stringData = new TextDecoder('utf-8').decode(depressedData.buffer)
    const parseredData = JSON.parse(stringData) as API.TagVo[]
    return parseredData
  }

  /** 更新图标标签数据 */
  const updateIconTag = async () => {
    // 检查 MD5 是否有变化，如无则跳过更新
    const newMD5 = await getIconTagMD5()
    const oldMD5 = (await db.md5.get('iconTag-0'))?.value
    if (newMD5 === oldMD5)
      return 0
    const parseredData = await getIconTagData()
    const localTotal = await db.iconTag.count()
    // 当本地图标标签数大于远程图标标签数时，需要同步已删除的图标标签，所以这里做一次清空
    localTotal > parseredData.length && await db.iconTag.clear()
    await AppDatabaseApi.iconTag.bulkPut(parseredData)
    // 图标标签信息成功之后才更新本地 MD5
    await db.md5.put({ id: 'iconTag-0', value: newMD5 })
    return parseredData.length
  }

  /** 全量更新 */
  const updateAll = async () => {
    try {
      _loading.value = true
      const startTime = dayjs()
      const total = await updateIconTag()
      const spentTime = (dayjs().diff(startTime) / 1000).toFixed(0)
      localSettings.value.noticeDataUpdated && ElNotification.success({
        title: !total ? '图标标签已经是最新' : '图标标签更新成功',
        message: !total ? undefined : `本次共更新图标标签 ${total} 个，耗时 ${spentTime} 秒`,
        position: 'bottom-right',
      })
    }
    catch (err) {
      ElNotification.error({
        title: '图标标签更新失败',
        message: messageFrom(err),
        position: 'bottom-right',
      })
    }
    finally {
      _loading.value = false
    }
  }

  /** 清除全部图标标签 */
  const clearAll = async () => {
    try {
      _loading.value = true
      await db.iconTag.clear()
      await db.md5.where('id').startsWith('iconTag-').delete()
    }
    catch {
      // no action
    }
    finally {
      _loading.value = false
    }
  }

  /** 清除后台定时任务 */
  const clearBackgroundUpdate = () => {
    window.clearTimeout(_updateTimer.value)
    _updateTimer.value = undefined
  }

  /** 后台定时自动更新 */
  const backgroundUpdate = async () => {
    if (_updateTimer.value !== undefined)
      clearBackgroundUpdate()
    await updateAll()
    const interval = (localSettings.value.autoUpdateInterval ?? 20) * 60000
    _updateEnd.value = new Date().getTime() + interval
    _updateTimer.value = window.setTimeout(() => {
      _updateTimer.value = undefined
      backgroundUpdate()
    }, interval)
  }

  liveQuery(() => db.iconTag.toArray()).subscribe((iconTagList) => {
    _total.value = iconTagList.length
    _iconList.value = iconTagList
  })

  return {
    // getters
    total,
    iconTagMap,
    updateAllLoading,
    updateAllRestTime,

    // actions
    getIconTagMD5,
    resetMD5,
    getIconTagData,
    updateIconTag,
    updateAll,
    clearAll,
    clearBackgroundUpdate,
    backgroundUpdate,
  }
})
