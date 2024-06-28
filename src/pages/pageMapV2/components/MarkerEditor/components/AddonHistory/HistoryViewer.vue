<script setup lang="ts">
import HistoryDifferItem from './HistoryDifferItem.vue'
import DifferText from './DifferText.vue'
import DifferItem from './DifferItem.vue'
import DifferUser from './DifferUser.vue'

const props = defineProps<{
  loading?: boolean
  preHistory?: API.HistoryVo
  nextHistory?: API.HistoryVo
  users: Map<string, API.SysUserSmallVo>
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
  <el-skeleton :rows="5" :loading="loading" animated>
    <template #default>
      <div v-if="!nextContent" class="grid place-items-center text-[var(--el-text-color-secondary)]">
        无记录内容
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

        <HistoryDifferItem label="修改人">
          <DifferUser
            :users="users"
            :user-id="nextHistory?.updaterId"
          />
        </HistoryDifferItem>
      </div>
    </template>
  </el-skeleton>
</template>
