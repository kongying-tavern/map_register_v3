<script setup lang="ts">
import Api from '@/api/api'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import { useIconTagStore } from '@/stores'
import { formatByteSize } from '@/utils'
import { Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash'
import { IconEditor } from '.'
import { useIconDelete } from '../hooks'

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
      seed.push(Api.user
        .getUserInfo({ userId })
        .then(({ data = {} }) => data)
        .catch(() => ({ id: userId } as API.SysUserVo)),
      )
    }
    return seed
  }, [] as Promise<API.SysUserVo>[])),
})

const { state, isLoading, execute } = useAsyncState<{ url?: string, size?: number[], byteLength?: number }>(async () => {
  if (!props.tag?.url)
    return {}
  const res = await fetch(props.tag.url)
  const blob = await res.blob()
  const bmp = await createImageBitmap(blob)
  return {
    url: props.tag.url,
    byteLength: blob.size,
    size: [bmp.width, bmp.height],
  }
}, {}, { immediate: false })

watch(() => props.tag, () => execute(), { immediate: true })

onSuccess(userInfos => userInfos.forEach((userInfo) => {
  userCache.value[userInfo.id!] = userInfo
}))

// ==================== 图标信息 ====================
const iconTag = defineModel<API.TagVo | null>('modelValue', {
  default: null,
})

const form = ref(cloneDeep(props.tag ?? {}))

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

// 删除图标
const { confirmDeleteIcon } = useIconDelete()

watch(() => props.tag, () => {
  if (!props.tag)
    return
  form.value = cloneDeep(iconTag.value ?? {})
  form.value.creatorId !== undefined && getUserInfo([props.tag.creatorId!, props.tag.updaterId!])
})

// ==================== 其他 ====================
const timeFormatter = (time?: string) => {
  if (!time)
    return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <div
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
      >
        <img
          :src="iconTag.url"
          class="hover:bg-[var(--el-color-primary)] max-w-full max-h-full object-contain"
          crossorigin=""
        >
      </div>

      <div class="icon-detail flex-1 px-2">
        <el-form label-width="70px" label-position="left" :model="form">
          <el-form-item label-width="0px" class="margin-bottom-0">
            <el-button class="flex-1" @click="openImageEditor">
              修改图片
            </el-button>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              @click="() => confirmDeleteIcon(form)"
            />
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

          <el-form-item label="创建人" class="margin-bottom-0">
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

          <el-form-item label="分辨率" class="margin-bottom-0">
            <el-text>{{ isLoading ? '......' : `${state.size?.[0]} x ${state.size?.[1]}` }}</el-text>
          </el-form-item>

          <el-form-item label="文件大小" class="margin-bottom-0">
            <el-text>{{ isLoading ? '......' : formatByteSize(state.byteLength ?? 0) }}</el-text>
          </el-form-item>
        </el-form>
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
