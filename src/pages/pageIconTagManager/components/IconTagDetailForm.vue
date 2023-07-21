<script lang="ts" setup>
import { Close, Loading } from '@element-plus/icons-vue'
import { PgUnit, useFetchHook, usePagination } from '@/hooks'
import Api from '@/api/api'
import type { ElFormType } from '@/shared'
import type { ItemFormRules } from '@/utils'

const props = defineProps<{
  modelValue: API.TagVo
}>()

const emits = defineEmits<{
  'update:modelValue': [data: API.TagVo]
}>()

interface IconObject extends API.IconVo {
  disabled: boolean
  loading: boolean
}

const tagName = computed({
  get: () => props.modelValue.tag,
  set: tag => emits('update:modelValue', { ...props.modelValue, tag }),
})

const iconId = computed({
  get: () => props.modelValue.iconId,
  set: iconId => emits('update:modelValue', { ...props.modelValue, iconId }),
})

const { pagination, layout } = usePagination({
  init: {
    current: 1,
    pageSize: 30,
    total: 0,
  },
  units: [PgUnit.PREV, PgUnit.JUMPER, PgUnit.SLOT, PgUnit.NEXT],
})

const { loading, refresh: updateIconList, onSuccess } = useFetchHook({
  immediate: true,
  onRequest: () => Api.icon.listIcon({
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

const iconList = ref<IconObject[]>([])
onSuccess(({ data: { record = [], total = 0 } = {} }) => {
  iconList.value = record.map(icon => ({ ...icon, disabled: false, loading: true }))
  pagination.value.total = total
})

const selectedIcon = ref<API.IconVo | null>(null)
const { onSuccess: onSearchInitIconSuccess } = useFetchHook({
  immediate: props.modelValue.id !== undefined,
  onRequest: () => Api.icon.listIcon({
    iconIdList: [props.modelValue.id!],
  }),
})

onSearchInitIconSuccess(({ data: { record = [] } = {} }) => {
  const result = record[0]
  if (!result)
    return
  selectedIcon.value = result
})

const setIcon = (icon: IconObject) => {
  if (selectedIcon.value && selectedIcon.value.id === icon.id) {
    iconId.value = undefined
    selectedIcon.value = null
    return
  }
  iconId.value = icon.id!
  selectedIcon.value = icon
}

// ==================== 事件委托 ====================
const IDENTIFICATION_SYMBOL = crypto.randomUUID()

const isTarget = (target: EventTarget | null = null): target is HTMLImageElement => {
  return target instanceof HTMLImageElement && target.dataset.symbol === IDENTIFICATION_SYMBOL
}

const setIconProps = (index: number, props: Partial<IconObject>) => {
  if (!(index in iconList.value))
    return
  iconList.value[index] = {
    ...iconList.value[index],
    ...props,
  }
}

useEventListener(document, 'error', ev => isTarget(ev.target) && setIconProps(Number(ev.target.dataset.index), {
  disabled: true,
  loading: false,
}), { capture: true })

useEventListener(document, 'load', ev => isTarget(ev.target) && setIconProps(Number(ev.target.dataset.index), {
  loading: false,
}), { capture: true })

const proxySetIcon = (ev: Event) => {
  if (!isTarget(ev.target))
    return
  const index = Number(ev.target.dataset.index)
  if (!(index in iconList.value))
    return
  setIcon(iconList.value[index])
}

const formRef = shallowRef<ElFormType | null>(null)

const rules: ItemFormRules<API.TagVo> = {
  tag: [
    {
      required: true,
      message: '标签名称不能为空',
      validator: () => (tagName.value = tagName.value?.replace(/\s+/g, '') ?? '').length > 0,
      trigger: 'change',
    },
  ],
  iconId: [{
    required: true,
    message: '请选择图标',
    validator: () => iconId.value !== undefined,
    trigger: 'change',
  }],
}

defineExpose({
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <el-form ref="formRef" :model="modelValue" :rules="rules" label-width="80px">
    <el-form-item label="Tag" prop="tag">
      <el-input v-model="tagName" placeholder="请输入标签名称" />
    </el-form-item>

    <el-form-item label="关联图标" prop="iconId">
      <div style="width: 298px;">
        <div
          class="h-14 flex items-center rounded border mb-2 p-2"
          :style="{
            'border-color': selectedIcon ? 'var(--el-color-primary-light-7)' : 'var(--el-border-color)',
            'background-color': selectedIcon ? 'var(--el-color-primary-light-9)' : '',
          }"
        >
          <template v-if="selectedIcon">
            <img :src="selectedIcon.url" class="w-10 h-10 aspect-square object-contain">
            <span class="px-2">{{ selectedIcon.name }}</span>
          </template>
          <el-text v-else type="info">
            请选择图标
          </el-text>
        </div>

        <div v-loading="loading" class="grid grid-cols-6 grid-rows-5 gap-0.5" style="height: 248px;" @click="proxySetIcon">
          <div v-for="(icon, index) in iconList" :key="icon.id" class="w-12 h-12 grid place-items-center">
            <img
              v-if="!icon.disabled"
              v-show="!icon.loading"
              :src="icon.url"
              :data-symbol="IDENTIFICATION_SYMBOL"
              :data-index="index"
              class="icon-item w-full aspect-square object-contain border-2 rounded cursor-pointer"
              :class="{
                actived: icon.id === iconId,
              }"
              crossorigin=""
            >
            <el-icon v-else :size="36" color="var(--el-color-danger)" class="cursor-not-allowed">
              <Close />
            </el-icon>
            <el-icon v-show="icon.loading" :size="36" class="animate-spin">
              <Loading />
            </el-icon>
          </div>
        </div>

        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :disabled="loading"
          :total="pagination.total"
          :layout="layout"
          background
          class="w-full flex justify-between items-center mt-2"
          @current-change="updateIconList"
        >
          <template #default>
            <el-text>
              {{ `，共 ${Math.ceil(pagination.total / pagination.pageSize)} 页` }}
            </el-text>
          </template>
        </el-pagination>
      </div>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.icon-item {
  border-color: var(--el-color-primary-light-8);
  background-color: transparent;
  transition: all ease 100ms;

  &:not(.actived):hover {
    border-color: var(--el-color-primary-light-7);
    background-color: var(--el-color-primary-light-9);
  }

  &:not(.actived):active {
    border-color: var(--el-color-primary-light-5);
    background-color: var(--el-color-primary-light-7);
  }

  &.actived {
    border-color: var(--el-color-success);
    background-color: var(--el-color-success-light-7);
  }
}
</style>
