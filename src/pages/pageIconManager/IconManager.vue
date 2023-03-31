<script lang="ts" setup>
import { useIconList } from '@/hooks'

const { iconList } = useIconList({
  immediate: true,
})

const test = () => {
  console.log(iconList.value)
}
</script>

<template>
  <div class="h-full">
    <el-button @click="test">
      打印
    </el-button>
  </div>
</template>
