<script lang="ts" setup>
import { useCondition } from '@/pages/pageMapV2/hooks'

const conditionManager = useCondition()

const test = () => {
  console.log(Object.fromEntries(conditionManager.conditions.entries()))
}
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <el-button @click="test">
      打印点位
    </el-button>
  </div>
</template>
