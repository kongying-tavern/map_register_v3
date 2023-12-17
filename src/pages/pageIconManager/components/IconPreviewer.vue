<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { Check, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useIconDelete } from '../hooks'
import { IconEditor } from '.'
import { useIconTagStore } from '@/stores'
import Api from '@/api/api'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import db from '@/database'

const props = defineProps<{
  tag?: API.TagVo | null
}>()

const iconTagStore = useIconTagStore()

const { DialogService } = useGlobalDialog()

// ==================== 用户信息 ====================
const userCache = ref<Record<number, API.SysUserVo>>({})

const { refresh: getUserInfo, loading: isUserInfoLoading, onSuccess } = useFetchHook<API.SysUserVo[], [userIds: number[]]>({
  onRequest: (userIds: number[]) => Promise.all([...new Set(userIds)].reduce((seed, userId) => {
    if (userCache.value[userId] === undefined) {
      seed.push(Api.sysUserController
        .getUserInfo({ userId })
        .then(({ data = {} }) => data)
        .catch(() => ({ id: userId } as API.SysUserVo)),
      )
    }
    return seed
  }, [] as Promise<API.SysUserVo>[])),
})

onSuccess(userInfos => userInfos.forEach((userInfo) => {
  userCache.value[userInfo.id!] = userInfo
}))

// ==================== 图标信息 ====================
const iconTag = defineModel<API.TagVo | null>('modelValue', {
  default: null,
})

const form = ref(cloneDeep(props.tag ?? {}))

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
const { refresh: updateType, loading: isTypeUpdateLoading, onSuccess: onTypeUpdateSuccess, onError: onTypeUpdateError } = useFetchHook({
  onRequest: async () => {
    const { tag = '', typeIdList } = form.value
    await Api.tag.updateTypeInTag({ tag, typeIdList })
    const { data = {} } = await Api.tag.getTag({ name: tag })
    await db.iconTag.put(data)
    return data
  },
})

// 删除图标
const { confirmDeleteIcon } = useIconDelete()

onTypeUpdateSuccess(() => {
  ElMessage.success({
    message: '编辑成功',
    offset: 48,
  })
})

onTypeUpdateError(err => ElMessage.error({
  message: `编辑失败，原因为：${err.message}`,
  offset: 48,
}))

watch(() => props.tag, () => {
  if (isTypeUpdateLoading.value)
    return
  if (!props.tag)
    return
  form.value = cloneDeep(iconTag.value ?? {})
  form.value.creatorId !== undefined && getUserInfo([props.tag.creatorId!, props.tag.updaterId!])
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
    v-loading.fullscreen="isTypeUpdateLoading"
    element-loading-text="操作中..."
    element-loading-background="var(--el-overlay-color-lighter)"
    class="icon-previewer h-full"
  >
    <div v-if="!iconTag" class="w-64 h-full grid place-items-center">
      选择要预览的图标
    </div>

    <div v-else class="w-64 h-full overflow-auto flex flex-col">
      <div v-if="!iconTagStore.tagPositionMap[iconTag.tag!]" class="icon-image h-64" />

      <div
        v-else
        class="icon-image h-64 grid place-items-center overflow-hidden flex-shrink-0"
        :style="{
          '--bg': `url(${iconTagStore.tagSpriteUrl})`,
          '--x': `${-iconTagStore.tagPositionMap[iconTag.tag!]?.[0]}px`,
          '--y': `${-iconTagStore.tagPositionMap[iconTag.tag!]?.[1]}px`,
        }"
      >
        <div class="image-box w-16 h-16" />
      </div>

      <div class="icon-detail flex-1 px-2">
        <el-form label-width="70px" label-position="left" :model="form" :disabled="isTypeUpdateLoading">
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

          <el-form-item label="图片 id" class="margin-bottom-0">
            <el-text>
              {{ form.iconId }}
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

          <el-form-item label="修改人" class="margin-bottom-0">
            <el-text truncated>
              {{ isUserInfoLoading ? '...' : userCache[form.creatorId ?? -1]?.nickname }} (id:{{ form.creatorId }})
            </el-text>
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

        <div class="flex mt-3">
          <el-button
            class="flex-1"
            :disabled="!isTypeChange"
            :type="isTypeChange ? 'primary' : 'default'"
            :icon="Check"
            :loading="isTypeUpdateLoading"
            @click="updateType"
          >
            保存分类
          </el-button>
          <el-button
            :icon="Delete"
            type="danger"
            plain
            :disabled="isTypeUpdateLoading"
            @click="() => confirmDeleteIcon(form)"
          />
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
