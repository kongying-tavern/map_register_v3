<script lang="ts" setup>
import Api from '@/api/api'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useFetchHook } from '@/hooks'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AreaDetailForm } from '.'

const props = defineProps<{
  area: API.AreaVo
  parent?: API.AreaVo
}>()

const emits = defineEmits<{
  success: [API.AreaVo]
  close: []
}>()

const formData = ref<API.AreaVo>(props.area)
const copyItems = shallowRef<API.ItemVo[]>([])

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    await Api.area.updateArea(formData.value)
    copyItems.value.length > 0 && await Api.item.copyItemToArea({ areaId: formData.value.id! }, copyItems.value.map(item => item.id!))
    return formData.value
  },
})

onSuccess((form) => {
  ElMessage.success({
    message: '编辑地区成功',
  })
  emits('close')
  emits('success', form)
})

onError(err => ElMessage.error({
  message: `编辑地区失败，原因为：${err.message}`,
}))

const formRef = ref<InstanceType<typeof AreaDetailForm> | null>(null)
const updateArea = async () => {
  try {
    await formRef.value?.validate()
    await submit()
  }
  catch {
    // validate, no error
  }
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="() => emits('close')">
      {{ area.name }} (ID: {{ area.id }}) 编辑地区
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <AreaDetailForm ref="formRef" v-model="formData" v-model:items="copyItems" :parent="parent" />
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" type="primary" :loading="loading" @click="updateArea">
        确定
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="() => emits('close')">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
