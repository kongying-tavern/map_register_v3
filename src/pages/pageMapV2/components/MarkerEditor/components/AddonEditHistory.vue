<script lang="ts" setup>
import { Clock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { AddonTeleporter } from '.'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import 'dayjs/locale/zh-cn'

const props = defineProps<{
  addonId: string
  markerVo: API.MarkerVo
}>()

const emits = defineEmits<{
  (e: 'update:addonId', v?: string): void
  (e: 'update:markerVo', v: API.MarkerVo): void
}>()

const isAddonActived = computed({
  get: () => props.addonId === 'history',
  set: v => emits('update:addonId', v ? 'history' : ''),
})

const current = ref(1)

const historyies = ref<API.HistoryVo[]>([])
/** 是否还有更多记录 */
const moreDisabled = ref(false)
/** 是否显示无修改记录 */
const showUnchangedHistory = ref(false)

const { loading, refresh, onSuccess } = useFetchHook({
  immediate: import.meta.env.VITE_DEVELOPMENT_MODE !== 'offline',
  onRequest: async () => {
    const { data: { record = [] } = {} } = await Api.history.getList({
      current: current.value,
      size: 20,
      id: [props.markerVo.id as number],
      /** 记录类型 3-物品 4-点位 */
      type: 4,
    })
    moreDisabled.value = record.length < 20
    const sortBayTimeData = record.sort((a, b) => dayjs(a.updateTime).valueOf() - dayjs(b.updateTime).valueOf())
    return sortBayTimeData
  },
})

const loadMoreHistory = () => {
  if (loading.value || moreDisabled.value)
    return
  current.value += 1
  refresh()
}

onSuccess((data) => {
  historyies.value = historyies.value.concat(data)
})

interface MarkerHistory extends API.HistoryVo {
  diffContent: Record<string, [string, string]>
}

const diffHistories = computed(() => historyies.value.reduce((seed, { content, ...rest }, index, arr) => {
  const diffMarker: Record<string, [string, string]> = {}
  const newObj = JSON.parse(content ?? '{}')
  const oldObj = JSON.parse(arr[index - 1]?.content ?? '{}')
  for (const key in newObj) {
    const oldValue = oldObj[key]
    const newValue = newObj[key]
    ;(oldValue !== newValue) && (diffMarker[key] = [oldValue, newValue])
  }
  (showUnchangedHistory.value || (Object.keys(diffMarker).length > 0)) && seed.push({
    ...rest,
    diffContent: diffMarker,
  })
  return seed
}, [] as MarkerHistory[]))

/** 格式化时间显示 */
const formatTime = (time?: string) => dayjs(time)
  .locale('zh-cn')
  .format('YYYY-MM-DD HH:mm:ss dddd')

/** 读取历史记录到表单 */
const useHistory = (id?: number) => {
  const findHistory = historyies.value.find(history => history.id === id)
  if (!findHistory)
    return
  emits('update:markerVo', JSON.parse(findHistory.content ?? '{}') as API.MarkerVo)
  ElMessage.success(`${formatTime(findHistory.updateTime)} 的记录已加载到表单`)
}

const moreHistoryRef = ref<HTMLElement | null>(null)
useIntersectionObserver(moreHistoryRef, ([{ isIntersecting }]) => {
  isIntersecting && loadMoreHistory()
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <el-button
    :icon="Clock"
    :type="isAddonActived ? 'primary' : 'default'"
    :disabled="isOfflineMode"
    :title="`编辑历史${isOfflineMode ? '(离线模式下不可用)' : ''}`"
    circle
    style="margin-left:0"
    @click="isAddonActived = !isAddonActived"
  />

  <AddonTeleporter :active="isAddonActived">
    <div class="h-full w-full flex flex-col">
      <el-alert :closable="false" type="info">
        点位编辑历史（时间正序）
        <br>
        红色表示删除，绿色表示新增，同时存在时表示修改
      </el-alert>

      <div class="flex items-center gap-2 py-1">
        <el-checkbox v-model="showUnchangedHistory" :border="true" label="显示无修改记录" />
      </div>

      <div class="flex-1 w-full overflow-hidden border rounded" style="border-color: var(--el-border-color)">
        <div v-if="!diffHistories.length" class="h-full grid place-items-center">
          暂无历史记录
        </div>
        <el-scrollbar v-else height="100%">
          <el-timeline class="w-full h-full p-2">
            <el-timeline-item
              v-for="history in diffHistories"
              :key="history.id"
              :timestamp="formatTime(history.updateTime)"
              placement="top"
              style="content-visibility:auto;"
            >
              <template v-if="Object.keys(history.diffContent).length === 0">
                无修改
              </template>
              <template v-else>
                <div v-for="(value, key) in history.diffContent" :key="key">
                  <el-tag>{{ key }}</el-tag>
                  <div class="border-l-2 m-1 pl-1" style="border-color: var(--el-border-color)">
                    <el-alert v-if="value[0]" :closable="false" type="error" style="overflow: auto;">
                      {{ value[0] }}
                    </el-alert>
                    <el-alert :closable="false" type="success" style="overflow: auto;">
                      {{ value[1] }}
                    </el-alert>
                  </div>
                </div>
                <el-button style="width:100%" @click="() => useHistory(history.id)">
                  使用该记录的数据
                </el-button>
              </template>
            </el-timeline-item>
          </el-timeline>

          <div ref="moreHistoryRef" class="text-center p-2">
            {{ moreDisabled ? '没有更多' : loading ? '加载中...' : '更多...' }}
          </div>
        </el-scrollbar>
      </div>
    </div>
  </AddonTeleporter>
</template>
