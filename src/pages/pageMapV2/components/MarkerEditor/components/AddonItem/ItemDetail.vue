<script lang="ts" setup>
import { AppItemSelecter } from '@/components'

defineProps<{
  isAreaDisabled?: (area: API.AreaVo) => boolean
}>()

const modelValue = defineModel<API.ItemVo[]>({
  required: false,
  default: () => [],
})

const areaCode = defineModel<string>('areaCode', {
  required: false,
  default: '',
})
</script>

<template>
  <div class="h-full overflow-hidden flex flex-col gap-2">
    <AppItemSelecter
      v-model="modelValue"
      v-model:area-code="areaCode"
      :show-total="false"
      :is-area-disabled="isAreaDisabled"
      class="flex-1"
    />

    <el-alert :closable="false">
      切换地区时会自动选择同名物品，不存在上一地区的同名物品将会被清除。
    </el-alert>
  </div>
</template>
