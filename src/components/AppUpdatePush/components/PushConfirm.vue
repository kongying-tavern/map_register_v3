<script setup lang="ts">
import {
  GlobalDialogController,
  WinDialog,
  WinDialogFooter,
  WinDialogTitleBar,
} from '@/components'
import { Check, Close, WarnTriangleFilled } from '@element-plus/icons-vue'

const cancel = () => {
  GlobalDialogController.close(false)
}

const confirm = () => {
  GlobalDialogController.close(true)
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar @close="cancel">
      推送应用更新
    </WinDialogTitleBar>

    <div class="w-[300px] p-2 grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] gap-2">
      <div class=" row-span-2">
        <el-icon class="p-1" size="40" color="var(--el-color-warning)">
          <WarnTriangleFilled />
        </el-icon>
      </div>
      <div>此操作将使所有在线用户刷新页面，确认操作？</div>
    </div>

    <WinDialogFooter>
      <el-button :icon="Check" type="warning" @click="confirm">
        是
      </el-button>

      <el-button :icon="Close" @click="cancel">
        否
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
