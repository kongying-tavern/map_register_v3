<script setup lang="ts">
import HistoryDifferItem from './HistoryDifferItem.vue'
import DifferText from './DifferText.vue'
import DifferItem from './DifferItem.vue'
import DifferUser from './DifferUser.vue'
import { HIDDEN_FLAG_NAME_MAP } from '@/shared'

const props = defineProps<{
  loading?: boolean
  current: API.MarkerVo
  history?: API.HistoryVo
  users: Map<string, API.SysUserSmallVo>
}>()

const updator = computed(() => props.users.get(`${props.history?.updaterId}`))

const historyContent = computed(() => JSON.parse(props.history?.content ?? '{}') as API.MarkerVo)
</script>

<template>
  <el-skeleton :rows="5" :loading="loading" animated>
    <template #default>
      <div v-if="!history">
        无历史记录
      </div>
      <div v-else>
        <HistoryDifferItem label="点位名称">
          <DifferText
            :history="historyContent.markerTitle"
            :current="current.markerTitle"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="点位层级">
          <DifferText
            :history="JSON.stringify(historyContent.extra ?? Object.create({}))"
            :current="JSON.stringify(current.extra ?? Object.create({}))"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="所属物品">
          <DifferItem
            :history="historyContent.itemList"
            :current="current.itemList"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="点位描述">
          <DifferText
            :history="historyContent.content"
            :current="current.content"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="点位图像">
          <DifferText
            :history="historyContent.picture"
            :current="current.picture"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="显示状态">
          <DifferText
            :history="HIDDEN_FLAG_NAME_MAP[`${historyContent.hiddenFlag}`]"
            :current="HIDDEN_FLAG_NAME_MAP[`${current.hiddenFlag}`]"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="视频链接">
          <DifferText
            :history="historyContent.videoPath"
            :current="current.videoPath"
          />
        </HistoryDifferItem>

        <HistoryDifferItem label="修改人">
          <DifferUser :user-id="history.updaterId" :updator="updator" />
        </HistoryDifferItem>
      </div>
    </template>
  </el-skeleton>
</template>
