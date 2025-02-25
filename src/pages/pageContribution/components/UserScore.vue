<script setup lang="ts">
import type { S2DataConfig } from '@antv/s2'
import { useTheme } from '@/hooks'
import { DATA_START_TIME } from '@/shared/constant'
import { TableSheet } from '@antv/s2'
import { useTemplateRef } from 'vue'
import { useScoreData } from '../hooks'
import { disabledDate, shortcuts } from '../shared'

interface SheetableData {
  // user info
  userId: number
  nickname?: string
  // local data
  markerCreation: number
  // chars
  markerTitleChars: number
  contentChars: number
  // fields
  markerTitle: number
  content: number
  extra: number
  hiddenFlag: number
  picture: number
  position: number
  refreshTime: number
}

const containerRef = useTemplateRef('container')

const timeRange = ref(((): [number, number] => {
  return [
    DATA_START_TIME,
    DATA_START_TIME + 365 * 24 * 60 * 60 * 1000,
  ]
})())

const note = ref('就绪')
const sortKey = ref('markerTitle')
const sortType = ref<'ASC' | 'DESC'>('DESC')

const abortController = shallowRef<AbortController>()

const { data: rawData, loading, refresh, onSuccess, onError } = useScoreData({
  note,
  timeRange,
  abortController,
})

watch(timeRange, () => refresh())

onSuccess(() => {
  note.value = '完成'
})

onError((error) => {
  note.value = error.message
})

const sheetRef = shallowRef<TableSheet>()

const buildDataConfig = (data: SheetableData[]): S2DataConfig => {
  return {
    fields: {
      columns: [
        {
          title: '用户',
          field: 'user',
          children: [
            { field: 'userId', title: 'UID' },
            { field: 'nickname', title: '昵称' },
          ],
        },
        {
          title: '次数',
          field: 'fields',
          children: [
            { field: 'markerCreation', title: '创建点位' },
            { field: 'markerTitle', title: '点位标题' },
            { field: 'content', title: '点位描述' },
            { field: 'position', title: '点位坐标' },
            { field: 'picture', title: '点位图片' },
            { field: 'extra', title: '附加信息' },
            { field: 'hiddenFlag', title: '显示状态' },
            { field: 'refreshTime', title: '刷新时间' },
          ],
        },
        {
          title: '字数',
          field: 'chars',
          children: [
            { field: 'markerTitleChars', title: '点位标题' },
            { field: 'contentChars', title: '点位描述' },
          ],
        },
      ],
      values: [
        'markerTitleChars',
        'contentChars',
        'markerTitle',
        'content',
        'position',
        'picture',
        'extra',
        'hiddenFlag',
        'refreshTime',
      ],
    },
    sortParams: [
      {
        sortFieldId: sortKey.value,
        sortMethod: sortType.value,
      },
    ],
    data: data as unknown as Record<string, string>[],
  }
}

const { isDark } = useTheme()

onMounted(() => {
  if (!containerRef.value)
    return

  const sheet = new TableSheet(
    containerRef.value,
    buildDataConfig(rawData.value),
    {
      hd: true,
      width: 800,
      height: 600,
      hierarchyType: 'grid',
      interaction: {
        copy: {
          enable: true,
          withFormat: true,
          withHeader: true,
        },
        resize: {
          colCellHorizontal: false,
          colCellVertical: false,
          rowCellVertical: false,
          cornerCellHorizontal: false,
        },
      },
      headerActionIcons: [
        {
          icons: ['Minus'],
          belongsCell: 'colCell',
          displayCondition: (meta) => {
            if (meta.level !== 1)
              return false
            return meta.field !== sortKey.value
          },
          onClick: ({ meta }) => {
            sortKey.value = meta.field
            sortType.value = 'DESC'
          },
        },
        {
          icons: ['SortUpSelected'],
          belongsCell: 'colCell',
          displayCondition: (meta) => {
            if (meta.level !== 1)
              return false
            return meta.field === sortKey.value && sortType.value === 'ASC'
          },
          onClick: () => {
            sortType.value = 'DESC'
          },
        },
        {
          icons: ['SortDownSelected'],
          belongsCell: 'colCell',
          displayCondition: (meta) => {
            if (meta.level !== 1)
              return false
            return meta.field === sortKey.value && sortType.value === 'DESC'
          },
          onClick: () => {
            sortType.value = 'ASC'
          },
        },
      ],
    },
  )

  sheetRef.value = sheet

  sheet.setThemeCfg({
    name: isDark.value ? 'dark' : 'default',
  })

  sheet.render()
})

onBeforeUnmount(() => {
  abortController.value?.abort()
  sheetRef.value?.destroy()
})

useResizeObserver(containerRef, ([entry]) => {
  const { width, height } = entry.contentRect
  sheetRef.value?.changeSheetSize(width, height)
  sheetRef.value?.render(false)
})

watch([sortKey, sortType], () => {
  sheetRef.value?.setDataCfg(buildDataConfig(rawData.value), false)
  sheetRef.value?.render()
})

watch(rawData, (data) => {
  sheetRef.value?.setDataCfg(buildDataConfig(data), true)
  sheetRef.value?.render()
})

watch(isDark, (dark) => {
  sheetRef.value?.setThemeCfg({
    name: dark ? 'dark' : 'default',
  })
  sheetRef.value?.render()
})
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-auto">
    <div class="flex items-enter gap-2 p-2">
      <el-text>排名时间段</el-text>

      <el-date-picker
        v-model="timeRange"
        type="datetimerange"
        :disabled-date
        :clearable="false"
        :value-on-clear="false"
        :teleported="false"
        :empty-values="[false]"
        :shortcuts="shortcuts"
        style="max-width: 400px;"
      />
    </div>

    <div
      ref="container"
      v-loading="loading"
      class="w-full flex-1 flex flex-wrap overflow-auto"
    />

    <div
      class="
      py-1 px-2
      text-xs text-[var(--el-text-color-secondary)]
      bg-[var(--el-color-info-light-9)]
      "
    >
      {{ note }}
    </div>
  </div>
</template>
