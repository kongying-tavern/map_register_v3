<script setup lang="ts">
import HistoryDifferItem from './HistoryDifferItem.vue'
import DifferCoord from './DifferCoord.vue'
import DifferText from './DifferText.vue'
import DifferItem from './DifferItem.vue'
import DifferImage from './DifferImage.vue'
import DifferExtra from './DifferExtra.vue'
import { HIDDEN_FLAG_NAME_MAP } from '@/shared'

defineProps<{
  loading?: boolean
  newContent: API.MarkerVo
  oldContent: API.MarkerVo
  autoCollapse?: boolean
}>()

const isPlainDifferent = <T = unknown>(current?: T, history?: T) => current !== history

const isExtraDifferent = (current: Record<string, unknown> = {}, history: Record<string, unknown> = {}) => {
  return JSON.stringify(current) !== JSON.stringify(history)
}

const isItemDifferent = (current: API.MarkerItemLinkVo[] = [], history: API.MarkerItemLinkVo[] = []) => {
  const itemCountMap = current.reduce((map, { itemId, count = 0 }) => map.set(itemId!, count), new Map<number, number>())

  history.forEach(({ itemId, count = 0 }) => {
    const newOne = itemCountMap.get(itemId!)
    if (newOne === undefined || newOne !== count) {
      itemCountMap.set(itemId!, count)
      return
    }
    itemCountMap.delete(itemId!)
  })

  return itemCountMap.size > 0
}
</script>

<template>
  <el-skeleton :rows="5" :loading="loading" animated>
    <template #default>
      <HistoryDifferItem
        label="点位名称"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(newContent.markerTitle, oldContent.markerTitle)"
      >
        <DifferText
          :current="newContent.markerTitle"
          :history="oldContent.markerTitle"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="附加信息"
        :auto-collapse="autoCollapse"
        :is-different="isExtraDifferent(newContent.extra, oldContent.extra)"
      >
        <template #default="{ isDifferent }">
          <DifferExtra
            :current="newContent.extra"
            :history="oldContent.extra"
            :is-different="isDifferent"
          />
        </template>
      </HistoryDifferItem>

      <HistoryDifferItem
        label="所属物品"
        :auto-collapse="autoCollapse"
        :is-different="isItemDifferent(newContent.itemList, oldContent.itemList)"
      >
        <DifferItem
          :current="newContent.itemList"
          :history="oldContent.itemList"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="点位描述"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(newContent.content, oldContent.content)"
      >
        <DifferText
          :current="newContent.content"
          :history="oldContent.content"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="点位坐标"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(newContent.position, oldContent.position)"
      >
        <DifferCoord
          :current="newContent.position"
          :history="oldContent.position"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="点位图像"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(newContent.picture, oldContent.picture)"
      >
        <DifferImage
          :current="newContent.picture"
          :history="oldContent.picture"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="显示状态"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(oldContent.hiddenFlag, newContent.hiddenFlag)"
      >
        <DifferText
          :current="HIDDEN_FLAG_NAME_MAP[`${newContent.hiddenFlag}`]"
          :history="HIDDEN_FLAG_NAME_MAP[`${oldContent.hiddenFlag}`]"
        />
      </HistoryDifferItem>

      <HistoryDifferItem
        label="视频链接"
        :auto-collapse="autoCollapse"
        :is-different="isPlainDifferent(newContent.videoPath, oldContent.videoPath)"
      >
        <DifferText
          :current="newContent.videoPath"
          :history="oldContent.videoPath"
        />
      </HistoryDifferItem>
    </template>
  </el-skeleton>
</template>
