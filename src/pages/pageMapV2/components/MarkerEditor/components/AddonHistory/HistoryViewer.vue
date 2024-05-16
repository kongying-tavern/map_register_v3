<script setup lang="ts">
import HistoryDifferItem from './HistoryDifferItem.vue'
import DifferText from './DifferText.vue'
import DifferItem from './DifferItem.vue'

const props = defineProps<{
  preHistory?: API.HistoryVo
  nextHistory?: API.HistoryVo
}>()

const preContent = computed(() => props.preHistory
  ? JSON.parse(props.preHistory.content ?? '{}') as API.MarkerVo
  : undefined,
)

const nextContent = computed(() => props.nextHistory
  ? JSON.parse(props.nextHistory.content ?? '{}') as API.MarkerVo
  : undefined,
)
</script>

<template>
  <div>
    <div v-if="!nextContent">
      no next
    </div>

    <div v-else>
      <HistoryDifferItem label="点位标题">
        <DifferText
          :old-data="preContent?.markerTitle"
          :new-data="nextContent.markerTitle"
        />
      </HistoryDifferItem>

      <HistoryDifferItem label="所属物品">
        <DifferItem
          :old-data="preContent?.itemList"
          :new-data="nextContent.itemList"
        />
      </HistoryDifferItem>

      <HistoryDifferItem label="点位描述">
        <DifferText
          :old-data="preContent?.content"
          :new-data="nextContent.content"
        />
      </HistoryDifferItem>
    </div>
  </div>
</template>
