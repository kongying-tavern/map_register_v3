<script lang="ts" setup>
import { Clock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { TeleportExtra } from '.'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import 'dayjs/locale/zh-cn'

const props = defineProps<{
  extraId: string
  markerVo: API.MarkerVo
}>()

const emits = defineEmits<{
  (e: 'update:extraId', v?: string): void
  (e: 'update:markerVo', v: API.MarkerVo): void
}>()

const extraActive = computed(() => props.extraId === 'history')
const toggleExtraPanel = () => {
  emits('update:extraId', extraActive.value ? '' : 'history')
}

const current = ref(1)

const { loading, refresh, onSuccess } = useFetchHook({
  immediate: true,
  onRequest: async () => {
    const { data: { record = [] } = {} } = await Api.history.getList({
      current: current.value,
      size: 20,
      id: [props.markerVo.id as number],
      /** 记录类型 3-物品 4-点位 */
      type: 4,
    })
    const sortBayTimeData = record.sort((a, b) => dayjs(a.createTime).valueOf() - dayjs(b.createTime).valueOf())
    return sortBayTimeData
  },
})

const loadMoreHistory = () => {
  current.value += 1
  refresh()
}

const historyies = ref<API.HistoryVo[]>([])
/** 是否还有更多记录 */
const moreDisabled = ref(false)
/** 是否显示无修改记录 */
const showUnchangedHistory = ref(false)

onSuccess((data) => {
  if (data.length === 0) {
    moreDisabled.value = true
    return
  }
  historyies.value = historyies.value.concat(data)
})

interface MarkerHistory extends API.HistoryVo {
  content: Record<string, [string, string]>
  creator?: API.SysUserVo
}

const diffHistories = computed(() => historyies.value.reduce((seed, { content = {}, ...rest }, index, arr) => {
  const diffMarker: Record<string, [string, string]> = {}
  for (const key in content) {
    const oldValue = JSON.stringify(arr[index - 1]?.content?.[key as keyof API.MarkerVo])
    const newValue = JSON.stringify(content[key as keyof API.MarkerVo])
    ;(oldValue !== newValue) && (diffMarker[key] = [oldValue, newValue])
  }
  (showUnchangedHistory.value || (Object.keys(diffMarker).length > 0)) && seed.push({
    ...rest,
    content: diffMarker,
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
  emits('update:markerVo', findHistory.content as API.MarkerVo)
  ElMessage.success(`${formatTime(findHistory.createTime)} 的记录已加载到表单`)
}
</script>

<template>
  <el-button
    :icon="Clock"
    :type="extraActive ? 'primary' : 'default'"
    circle
    title="编辑历史"
    style="margin-left:0"
    @click="toggleExtraPanel"
  />

  <TeleportExtra :active="extraActive">
    <div class="h-full w-full flex flex-col">
      <el-alert :closable="false" type="info">
        点位编辑历史（时间正序）
        <br>
        红色表示删除，绿色表示新增，同时存在时表示修改
      </el-alert>

      <div class="flex items-center gap-2 py-1">
        <el-checkbox v-model="showUnchangedHistory" :border="true" label="显示无修改记录" />
      </div>

      <div class="flex-1 w-full overflow-hidden">
        <el-scrollbar height="100%">
          <el-timeline class="w-full h-full p-2">
            <el-timeline-item
              v-for="history in diffHistories"
              :key="history.id"
              :timestamp="formatTime(history.createTime)"
              placement="top"
              style="content-visibility:auto;"
            >
              <template v-if="Object.keys(history.content).length === 0">
                无修改
              </template>
              <template v-else>
                <div v-for="(value, key) in history.content" :key="key">
                  <el-tag>{{ key }}</el-tag>
                  <div class="border-l-2 m-1 pl-1">
                    <el-alert v-if="value[0]" :closable="false" type="error">
                      {{ value[0] }}
                    </el-alert>
                    <el-alert :closable="false" type="success">
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
        </el-scrollbar>
      </div>

      <el-button v-if="!moreDisabled" :loading="loading" @click="loadMoreHistory">
        更多
      </el-button>
    </div>
  </TeleportExtra>
</template>
