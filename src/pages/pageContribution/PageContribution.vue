<script setup lang="ts">
import { useFetchHook, useTheme } from '@/hooks'
import { useMarkerStore } from '@/stores'
import { Chart } from '@antv/g2'
import Api from '@/api/api'
import { lines } from '@antv/g-pattern'

interface UserCountInfo {
  userId: number
  count: number
}

const markerStore = useMarkerStore()
const { isDark } = useTheme()

const userMap = ref(new Map<number, API.SysUserVo>())

const markerChartContainerRef = useTemplateRef('containerRef$1')

const timeRange = ref(((): [number, number] => {
  const now = Date.now()
  return [
    0,
    now,
  ]
})())

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const now = Date.now()
      return [now - 7 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '最近一月',
    value: () => {
      const now = Date.now()
      return [now - 30 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '最近一年',
    value: () => {
      const now = Date.now()
      return [now - 365 * 24 * 3600 * 1000, now]
    },
  },
  {
    text: '全部',
    value: () => {
      const now = Date.now()
      return [0, now]
    },
  },
]

const histories = computed(() => {
  const [startTime, endTime] = timeRange.value
  const output = markerStore.markerList.reduce((result, { creatorId = -1, createTime }) => {
    if (!createTime)
      return result
    const time = new Date(createTime).getTime()
    if (time < startTime || time > endTime)
      return result
    if (result[creatorId] === undefined)
      result[creatorId] = { userId: creatorId, count: 0 }
    result[creatorId].count += 1
    return result
  }, [] as UserCountInfo[])

  return output
    .filter(Boolean)
    .sort(({ count: ca }, { count: cb }) => cb - ca)
    .slice(0, 10)
})

const { refresh: updateUsers, onSuccess: onUpdateUsers, loading } = useFetchHook({
  onRequest: async () => {
    const userIds = histories.value.reduce((ids, { userId }) => {
      ids.push(userId)
      return ids
    }, [] as number[])

    const missions: (() => Promise<API.SysUserVo>)[] = []

    userIds.forEach((userId) => {
      if (userMap.value.has(userId))
        return
      missions.push(async () => {
        try {
          const { data = { id: userId } } = await Api.user.getUserInfo({ userId })
          return data
        }
        catch {
          return { id: userId }
        }
      })
    })

    const userList = await Promise.all(missions.map(mission => mission()))

    return userList.reduce((map, user) => {
      return map.set(user.id!, user)
    }, new Map<number, API.SysUserVo>())
  },
})

onMounted(() => {
  if (!markerChartContainerRef.value)
    return

  const chart = new Chart({
    container: markerChartContainerRef.value,
    autoFit: true,
    theme: isDark.value ? 'classicDark' : 'classic',
    paddingRight: 40,
    title: '点位创建统计 (前 10 位)',
  })

  const maskChart = chart
    .interval()
    .theme({
      type: isDark.value ? 'classicDark' : 'classic',
    })
    .data([])
    .encode('x', 'userId')
    .encode('y', 30000)
    .style('fillOpacity', 0.1)
    .style('maxWidth', 32)
    .style('radius', 4)
    .tooltip(false)
    .animate(false)

  chart
    .interval()
    .theme({
      type: isDark.value ? 'classicDark' : 'classic',
    })
    .data([])
    .coordinate({ transform: [{ type: 'transpose' }] })
    .encode('x', 'userId')
    .encode('y', 'count')
    .axis('x', {
      title: false,
      size: 80,
      labelAutoEllipsis: true,
      labelFormatter: (userId: number) => {
        const { nickname = `ID:${userId}` } = userMap.value.get(userId) ?? {}
        return nickname
      },
    })
    .axis('y', {
      title: '创建点位数量',
    })
    .style('maxWidth', 32)
    .style('radius', 4)
    .style('fill', () => {
      return {
        image: lines({
          backgroundColor: '#A1E0D5',
          backgroundOpacity: 1,
          strokeOpacity: 0.6,
          stroke: isDark.value ? '#D1F6ED' : '#6DD0BF',
          lineWidth: 4,
          spacing: 5,
        }),
        repetition: 'repeat',
        transform: 'rotate(-45)',
      }
    })
    .label({
      text: 'count',
      textAlign: 'start',
      dx: 5,
    })
    .tooltip(false)

  chart.render()

  watch(isDark, (dark) => {
    chart.theme({
      type: dark ? 'classicDark' : 'classic',
    })
    chart.render()
  })

  const resize = useDebounceFn((width: number, height: number) => {
    chart.changeSize(width, height)
  }, 1000)

  useResizeObserver(markerChartContainerRef, (entries) => {
    if (!entries.length)
      return
    const [entry] = entries
    const { width, height } = entry.contentRect
    resize(width, height)
  })

  watch(histories, async () => {
    const maxCount = histories.value[0]?.count ?? 100
    const e = 10 ** (`${Math.floor(Math.max(0, maxCount))}`.length - 1)
    maskChart.encode('y', Math.ceil(maxCount / e) * e)
    chart.changeData(histories.value)
    await updateUsers()
  }, { deep: true, immediate: true })

  onUpdateUsers((newUserMap) => {
    newUserMap.forEach((user) => {
      userMap.value.set(user.id!, user)
    })
    chart.changeData(histories.value)
  })
})
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="flex items-center gap-2 p-2">
      <el-text>统计时间段</el-text>
      <div class="w-[400px]">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          :clearable="false"
          :value-on-clear="false"
          :teleported="false"
          :empty-values="[false]"
          :shortcuts="shortcuts"
        />
      </div>
    </div>
    <div ref="containerRef$1" class="flex-1 overflow-hidden" />
    <div class="text-xs text-[var(--el-text-color-secondary)] bg-[var(--el-color-info-light-9)] py-1 px-2">
      {{ loading ? '正在查询用户信息...' : '完成' }}
    </div>
  </div>
</template>
