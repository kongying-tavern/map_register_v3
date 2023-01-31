<script lang="ts" setup>
import { localSettings } from '@/stores'
</script>

<template>
  <div class="p-4">
    <el-form label-position="left" label-width="400px">
      <el-form-item label="点位加载完毕后移动到点集的几何中心">
        <el-switch v-model="localSettings.moveToCenter" />
      </el-form-item>
    </el-form>
  </div>
</template>
