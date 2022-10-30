<script lang="ts" setup>
import { useItemList } from './hooks'

const { itemlist, loading, updateList } = useItemList({
  onSuccess: list => console.log('[物品列表]', list),
  onError: err => console.log('[物品列表]', err),
})
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div>
      <el-button @click="updateList">
        debug
      </el-button>
    </div>
    <div>loading: {{ loading }}</div>
    <div>len: {{ itemlist.length }}</div>
  </div>
</template>
