<script setup lang="ts">
import { useFetchHook, useTheme } from '@/hooks'
import Api from '@/api/api'
import dayjs from 'dayjs'
import { from, mergeMap, toArray, lastValueFrom } from 'rxjs'
import { DATA_START_TIME } from '@/shared/constant'
import { disabledDate, shortcuts } from '../shared'
import type { ScoreVo } from '@/pages/pageScoreManager/shared'
import { TableSheet, type S2DataConfig } from '@antv/s2'
import db from '@/database'

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

const splitTimeRange = (startTime: number, endTime: number, unit: 'year' | 'month'): { startTime: number; endTime: number }[] => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const result: { startTime: number; endTime: number }[] = [];

  if (!start.isValid() || !end.isValid()) {
    throw new Error('Invalid start or end time');
  }

  if (unit === 'year') {
    let current = start.startOf('year');
    const endOfYear = end.endOf('year');

    while (current.isBefore(endOfYear) || current.isSame(endOfYear)) {
      const next = current.clone().endOf('year');
      result.push({
        startTime: current.valueOf(),
        endTime: next.isAfter(end) ? end.valueOf() : next.valueOf()
      });
      current = current.add(1, 'year').startOf('year');
    }
  } else if (unit === 'month') {
    let current = start.startOf('month');
    const endOfMonth = end.endOf('month');

    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth)) {
      const next = current.clone().endOf('month');
      result.push({
        startTime: current.valueOf(),
        endTime: next.isAfter(end) ? end.valueOf() : next.valueOf()
      });
      current = current.add(1, 'month').startOf('month');
    }
  } else {
    throw new Error('Invalid unit. Use "year" or "month".');
  }

  return result;
}

const promisePool = <T>(missions: (() => Promise<T>)[], limit = 6): Promise<T[]> => {
  return lastValueFrom(from(missions).pipe(
    mergeMap(mission => mission(), limit),
    toArray(),
  ))
}

const abortController = shallowRef<AbortController>()

const { data, loading, refresh, onSuccess, onError } = useFetchHook({
  immediate: true,
  initialValue: [],
  onRequest: async () => {
    if (!containerRef.value)
      return []

    const [rangeStartTime, rangeEndTime] = timeRange.value

    const start = dayjs(rangeStartTime)
    if (!start.isValid())
      throw new Error(`开始时间 "${rangeStartTime}" 不是一个合法的时间`)
    const end = dayjs(rangeEndTime)
    if (!end.isValid())
      throw new Error(`结束时间 "${rangeEndTime}" 不是一个合法的时间`)

    note.value = ''

    const result = splitTimeRange(rangeStartTime, rangeEndTime, 'month')

    let generatedCount = 0

    const newAbortController = new AbortController()

    abortController.value = newAbortController

    const cachedScoreList = await db.scoreCache.toArray()
    const cachedScoreSet = new Set(cachedScoreList.map(({ id }) => id))

    const missions = result.map(({ startTime, endTime }) => {
      return async () => {
        const rangeId = `${startTime}-${endTime}`
        // 查询区间是否已经生成过，是则跳过生成
        if (cachedScoreSet.has(rangeId)) {
          note.value = `正在生成评分: ${(100 * ++generatedCount / result.length).toFixed(2)}%`
          return
        }
        const { data: status, message = '' } = await Api.score.generate({
          span: 'DAY',
          scope: 'PUNCTUATE',
          startTime: startTime as unknown as string,
          endTime: endTime as unknown as string,
        }, {
          signal: newAbortController.signal,
        })
        if (status !== 'ok')
          throw new Error(message)
        note.value = `正在生成评分: ${(100 * ++generatedCount / result.length).toFixed(2)}%`
        return rangeId
      }
    })

    const generatedIds = await promisePool(missions, 6)

    // 缓存已经查询过的区间
    await db.scoreCache.bulkPut((generatedIds.filter(Boolean) as string[]).map(id => ({ id })))

    note.value = '正在汇总评分...'

    const { data: list = [] } = await Api.score.getData({
      span: 'DAY',
      scope: 'PUNCTUATE',
      startTime: rangeStartTime as unknown as string,
      endTime: rangeEndTime as unknown as string,
    })

    return list as ScoreVo[]
  },
})

watch(timeRange, () => refresh())

onSuccess(() => {
  note.value = '完成'
})

onError((error) => {
  note.value = error.message
})

interface SheetableData {
  userId: number
  nickname?: string
  markerTitleChars: number
  contentChars: number
  markerTitle: number
  content: number
  extra: number
  hiddenFlag: number
  picture: number
  position: number
  refreshTime: number
}

const transformeData = computed(() => {
  const list = data.value.reduce((result, { data: contribution = {}, userId, user: userInfo = {} } ) => {
    if (userId === undefined)
      return result

    const { chars = {}, fields = {} } = contribution
    const { markerTitle: markerTitleChars = 0, content: contentChars = 0 } = chars
    const {
      markerTitle = 0,
      content = 0,
      extra = 0,
      hiddenFlag = 0,
      picture = 0,
      position = 0,
      refreshTime = 0,
    } = fields

    result.push({
      userId,
      nickname: userInfo.nickname,
      markerTitleChars,
      contentChars,
      markerTitle,
      content,
      extra,
      hiddenFlag,
      picture,
      position,
      refreshTime,
    })

    return result
  }, [] as SheetableData[])

  return list
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
    buildDataConfig(transformeData.value),
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
  sheetRef.value?.setDataCfg(buildDataConfig(transformeData.value), false)
  sheetRef.value?.render()
})

watch(transformeData, (data) => {
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
