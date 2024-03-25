<script setup lang="ts">
import { Logger } from '@/utils'

const logger = new Logger('开发者')
</script>

<template>
  <div class="h-full grid place-items-center place-content-center overflow-hidden p-4">
    <el-text>
      当前页仅在开发模式下可见。在此处进行任意测试，但不要提交该目录下改动。
    </el-text>
    <el-button @click="() => logger.info('Hello world')">
      Logger
    </el-button>
  </div>
</template>
