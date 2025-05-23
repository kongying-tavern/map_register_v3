<script lang="ts" setup>
import Api from '@/api/api'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useFetchHook } from '@/hooks'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AreaDetailForm } from '.'

const props = defineProps<{
  parent?: API.AreaVo
}>()

const emits = defineEmits<{
  success: [API.AreaVo]
  close: []
}>()

const formData = ref<API.AreaVo>({
  parentId: props.parent?.id ?? -1,
  iconTag: '',
  isFinal: Boolean(props.parent),
})

const copyItems = shallowRef<API.ItemVo[]>([])

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    const { data: areaId } = await Api.area.createArea(formData.value)
    if (!areaId)
      throw new Error('无法确认新增地区的id')
    copyItems.value.length > 0 && await Api.item.copyItemToArea({ areaId }, copyItems.value.map(item => item.id!))
    const { data = {} } = await Api.area.getArea({ areaId })
    return data
  },
})

onSuccess((form) => {
  ElMessage.success({
    message: '新增地区成功',
  })
  emits('close')
  emits('success', form)
})

onError((err) => {
  ElMessage.error({
    message: `新增地区失败，原因为：${err.message}`,
  })
})

const formRef = ref<InstanceType<typeof AreaDetailForm> | null>(null)
const createArea = async () => {
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
      添加地区
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <AreaDetailForm ref="formRef" v-model="formData" v-model:items="copyItems" :parent="parent" />
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" type="primary" :loading="loading" @click="createArea">
        确定
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="() => emits('close')">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
