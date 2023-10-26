<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { Check, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { IconEditor } from '.'
import { useIconTagStore } from '@/stores'
import Api from '@/api/api'
import { type ItemFormRules } from '@/utils'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import db from '@/database'

const iconTagStore = useIconTagStore()
const { DialogService } = useGlobalDialog()

// ==================== 用户信息 ====================
const userCache = ref<Record<number, API.SysUserVo>>({})

const { refresh: getUserInfo, loading: isUserInfoLoading } = useFetchHook<void, [userId: number]>({
  onRequest: async (userId: number) => {
    if (userCache.value[userId])
      return
    const { data = {} } = await Api.sysUserController
      .getUserInfo({ userId })
      .catch(() => ({ data: {} as API.SysUserVo }))
    userCache.value[userId] = data
  },
})

// ==================== 图标信息 ====================
const iconTag = defineModel<API.TagVo | null>('modelValue', {
  default: null,
})

const form = ref(cloneDeep(iconTag.value ?? {}))

const isFormChange = computed(() => !isEqual(iconTag.value, form.value))
const isTypeChange = computed(() => !isEqual(iconTag.value?.typeIdList ?? [], form.value.typeIdList ?? []))

// ==================== 修改图片 ====================
const openImageEditor = () => {
  DialogService
    .config({
      width: 'fit-content',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      alignCenter: true,
    })
    .props({
      icon: form.value,
    })
    .open(IconEditor)
}

// ==================== 修改类型 ====================
const { refresh: submitEditIcon, loading: isEditing, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    const { tag = '', typeIdList } = form.value
    isTypeChange.value && await Api.tag.updateTypeInTag({ tag, typeIdList })
    const { data = {} } = await Api.tag.getTag({ name: tag })
    return data
  },
})

onSuccess(async (data) => {
  ElMessage.success({
    message: '编辑成功',
    offset: 48,
  })
  await db.iconTag.put(data)
  iconTag.value = data
})

onError(err => ElMessage.error({
  message: `编辑失败，原因为：${err.message}`,
  offset: 48,
}))

const rules: ItemFormRules<API.TagVo> = {
  tag: [{ required: true, message: '名称不能为空', validator: (_, v = '') => v.trim().length > 0, trigger: 'change' }],
}

watch(() => iconTag.value, () => {
  if (isEditing.value)
    return
  form.value = cloneDeep(iconTag.value ?? {})
  form.value.creatorId !== undefined && getUserInfo(form.value.creatorId)
})

// ==================== 图标类型 ====================
const tagTypeCache = ref<Record<number, API.TagTypeVo[]>>({})

const loadTagType = async (node: Node, resolve: (data: API.TagTypeVo[]) => void) => {
  if (tagTypeCache.value[node.data.id] !== undefined)
    return resolve(tagTypeCache.value[node.data.id])
  const { data: { record = [] } = {} } = await Api.tagType.listTagType({
    typeIdList: [node.level === 0 ? -1 : node.data.id],
    size: 256,
  })
  tagTypeCache.value[node.data.id] = record
  resolve(record)
}

// ==================== 其他 ====================
const timeFormatter = (time?: string) => {
  if (!time)
    return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <div
    v-loading.fullscreen="isEditing"
    element-loading-text="操作中..."
    element-loading-background="var(--el-overlay-color-lighter)"
    class="icon-previewer h-full"
  >
    <div v-if="!iconTag" class="w-64 h-full grid place-items-center">
      选择要预览的图标
    </div>

    <div v-else class="w-64 h-full overflow-auto flex flex-col">
      <div
        class="icon-image h-64 grid place-items-center overflow-hidden flex-shrink-0"
        :style="{
          '--bg': `url(${iconTagStore.tagSpriteImage})`,
          '--x': `${-iconTagStore.iconMapping[iconTag.tag!]?.[0]}px`,
          '--y': `${-iconTagStore.iconMapping[iconTag.tag!]?.[1]}px`,
        }"
      >
        <div class="image-box w-16 h-16" />
      </div>

      <div class="icon-detail flex-1 px-2">
        <el-form label-width="70px" label-position="left" :rules="rules" :model="form" :disabled="isEditing">
          <el-form-item label-width="0px" class="margin-bottom-0">
            <el-button class="w-full" @click="openImageEditor">
              修改图片
            </el-button>
          </el-form-item>

          <el-form-item label="名称" class="margin-bottom-0">
            <el-text truncated>
              {{ JSON.stringify(form.tag).slice(1, -1) }}
            </el-text>
          </el-form-item>

          <el-form-item label="作者" class="margin-bottom-0">
            <el-text truncated>
              {{ isUserInfoLoading ? '...' : userCache[form.creatorId ?? -1]?.nickname }} (id:{{ form.creatorId }})
            </el-text>
          </el-form-item>

          <el-form-item label="创建时间" class="margin-bottom-0">
            <el-text>{{ timeFormatter(form.createTime) }}</el-text>
          </el-form-item>

          <el-form-item label="修改时间" class="margin-bottom-0">
            <el-text>{{ timeFormatter(form.updateTime) }}</el-text>
          </el-form-item>

          <el-form-item label="分类" prop="typeIdList" class="margin-bottom-0">
            <el-tree-select
              v-model="form.typeIdList"
              style="width: 100%"
              node-key="id"
              clearable multiple collapse-tags collapse-tags-tooltip
              lazy accordion highlight-current show-checkbox check-strictly check-on-click-node
              :current-node-key="-1"
              :default-expanded-keys="[-1]"
              :expand-on-click-node="false"
              :props="{
                label: 'name',
                value: 'id',
                isLeaf: 'isFinal',
              }"
              :load="loadTagType"
            />
          </el-form-item>
        </el-form>

        <div class="flex mt-4">
          <el-button
            class="flex-1"
            :disabled="!isFormChange"
            :type="isFormChange ? 'primary' : 'default'"
            :icon="Check"
            :loading="isEditing"
            @click="submitEditIcon"
          >
            保存
          </el-button>
          <el-button :icon="Delete" type="danger" plain :disabled="isEditing" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.margin-bottom-0 {
  margin-bottom: 0;
}

.icon-previewer {
  overflow: hidden;
}

.icon-image {
  --s: 32px;

  --color-a: transparent;
  --color-b: var(--el-fill-color-darker);

  border: 8px solid transparent;
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--color-a) 25%,
    var(--color-b) 25%,
    var(--color-b) 50%,
    var(--color-a) 50%,
    var(--color-a) 75%,
    var(--color-b) 75%,
    var(--color-b) 100%
  );
  background-size: var(--s) var(--s);
  background-clip: padding-box;
}

.image-box {
  background: var(--bg);
  background-position: var(--x) var(--y);
  scale: 2;
}
</style>
