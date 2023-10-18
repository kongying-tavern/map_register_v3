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
import TagSpriteRendererWorker from '@/worker/tagSpriteRenderer.worker?worker'
import type { WorkerInput, WorkerOutput, WorkerSuccessOutput } from '@/worker/tagSpriteRenderer.worker'

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
  const _tagList = shallowRef<API.TagVo[]>([])
  const _total = ref(0)
  const _loading = ref(false)
  const _updateTimer = ref<number>()
  const _updateEnd = ref<number>()
  const _tagSpriteImage = ref('')
  const _iconMapping = shallowRef<Record<string, [number, number]>>({})

  const total = computed(() => _total.value)
  const iconTagMap = computed(() => Object.fromEntries(_tagList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)
  const updateAllLoading = computed(() => _loading.value)
  const updateAllRestTime = computed(() => _updateEnd.value === undefined ? 0 : _updateEnd.value - secondClock.value)
  const tagSpriteImage = computed(() => _tagSpriteImage.value)
  const iconMapping = computed(() => _iconMapping.value)

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

  const renderSpriteImage = (payload: WorkerInput) => new Promise<WorkerSuccessOutput>((resolve, reject) => {
    const worker = new TagSpriteRendererWorker()
    worker.onmessage = (ev: MessageEvent<WorkerOutput>) => {
      worker.terminate()
      if (typeof ev.data === 'string')
        return reject(new Error(ev.data))
      resolve(ev.data)
    }
    worker.postMessage(payload)
  })

  const createSpriteImage = async (list: API.TagVo[]) => {
    URL.revokeObjectURL(_tagSpriteImage.value)
    const md5 = await db.md5.get('iconTag-0')
    const cachedImage = md5 ? await db.imageCache.get(md5.value) : undefined
    if (cachedImage) {
      const { image, mapping } = cachedImage
      _tagSpriteImage.value = URL.createObjectURL(new Blob([image], { type: 'image/png' }))
      _iconMapping.value = mapping
      return
    }
    const res = await renderSpriteImage({
      tagList: list.map(tag => ({ tag: tag.tag!, url: tag.url! })),
    })
    _tagSpriteImage.value = URL.createObjectURL(new Blob([res.image], { type: 'image/png' }))
    _iconMapping.value = res.mapping
    await db.imageCache.put({
      ...res,
      id: md5?.value ?? 'temp',
    })
  }

  liveQuery(() => db.iconTag.toArray()).subscribe((iconTagList) => {
    _total.value = iconTagList.length
    _tagList.value = iconTagList
    createSpriteImage(iconTagList)
  })

  return {
    // getters
    total,
    iconTagMap,
    updateAllLoading,
    updateAllRestTime,
    tagSpriteImage,
    iconMapping,

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
