<script lang="ts" setup>
import { useMarkerList } from '@/pages/pageMapV2/hooks'

const { markerList } = useMarkerList()

const test = () => {
  console.log(markerList.value)
}
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <el-button @click="test">
      打印点位
    </el-button>
  </div>
</template>
