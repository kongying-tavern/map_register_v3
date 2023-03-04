<script lang="ts" setup>
import { ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'
import { emptyCheck } from '../utils/formRules'
import Api from '@/api/api'
import { messageFrom } from '@/utils'

const props = defineProps<{
  arealist: API.AreaVo[]
}>()

const emits = defineEmits<{
  (e: 'success'): void
}>()

/** 表单初始值 */
const initFormData: API.AreaVo = {
  name: '',
  code: '',
  iconTag: '',
  parentId: -1,
  isFinal: false,
  hiddenFlag: 0,
  sortIndex: 0,
}

/** 表单内容ref */
const formData = ref<API.AreaVo>(initFormData)

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

/** 关闭表单 */
const closeDialog = () => {
  if (loading.value)
    return
  dialogVisible.value = false
}

/** 关闭表单前的回调 */
const beforeClose = (done: () => void) => {
  if (loading.value)
    return
  done()
}

/** 表单校验规则 */
const rules: FormRules = {
  name: [emptyCheck()],
  code: [emptyCheck()],
  // iconTag: [emptyCheck()], // TODO: 图标选择器
  isFinal: [emptyCheck()],
  parentId: [emptyCheck()],
  hiddenFlag: [emptyCheck()],
  sortIndex: [emptyCheck()],
}

/** 重置表单 */
const resetFormState = () => {
  formData.value = initFormData
  formRef.value?.resetFields()
}

/** 确认表单 */
const onConfirm = async () => {
  try {
    await formRef.value?.validate().catch((err) => {
      throw new Error(`字段 [${Object.keys(err).join(', ')}] 未通过校验`)
    })
    loading.value = true
    const res = await Api.area.createArea(formData.value)
    ElMessage.success(res.message ?? '注册成功')
    dialogVisible.value = false
    resetFormState()
    emits('success')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
  finally {
    loading.value = false
  }
}

// 监听父级地区变化，判断是否为国家地区
watch(() => formData.value.parentId, (val) => {
  formData.value.isFinal = (val === -1)
})
</script>

<template>
  <div class="flex justify-end" v-bind="$attrs">
    <el-button type="primary" @click="dialogVisible = true">
      新增地区
    </el-button>

    <el-dialog v-model="dialogVisible" title="新增地区" width="450px" :before-close="beforeClose" @closed="resetFormState">
      <ElForm ref="formRef" :model="formData" :rules="rules" class="m-5" label-width="70">
        <el-form-item prop="name" label="地区名字">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item prop="code" label="地区代码">
          <el-input v-model="formData.code" />
        </el-form-item>
        <el-form-item prop="code" label="图标">
          <el-input v-model="formData.iconTag" />
        </el-form-item>
        <el-form-item prop="sortIndex" label="地区排序">
          <el-input v-model="formData.sortIndex" />
        </el-form-item>
        <el-form-item prop="parentId" label="父级地区">
          <el-select v-model="formData.parentId" placeholder="请选择父级地区">
            <el-option label="无" value="-1" />
            <el-option
              v-for="item in props.arealist"
              :key="item.areaId"
              :label="item.name"
              :value="item.areaId ?? 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="hiddenFlag" label="隐藏标志">
          <el-select v-model="formData.hiddenFlag" placeholder="请选择隐藏标志">
            <el-option label="显示" value="0" />
            <el-option label="隐藏" value="1" />
            <el-option label="内鬼" value="2" />
          </el-select>
        </el-form-item>
      </ElForm>

      <template #footer>
        <el-button @click="closeDialog">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="onConfirm">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user_create_type {
  display: flex;
  .q-select.q-field {
    min-width: 84px;
  }
  .q-input.q-field {
    flex: 1;
  }
}
</style>
