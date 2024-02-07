<script setup lang="ts">
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import Api from '@/api/api'
import db from '@/database'
import { useUserInfoStore } from '@/stores'

const emits = defineEmits<{
  success: [tag: API.TagVo]
}>()

const LENGTH_LIMIT = 16

const tagName = controlledRef('', {
  onBeforeChange: (value) => {
    const trimValue = value.trim()
    if (value !== trimValue)
      return false
    return trimValue.length >= 0 && trimValue.length <= LENGTH_LIMIT
  },
})

const userInfoStore = useUserInfoStore()

const { loading, refresh: createTag, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    const cacheTagName = tagName.value
    await Api.tag.createTag({ tagName: cacheTagName })

    // TODO 目前 tag 添加后需要等待缓存刷新才能查询到更新，这里将添加后的信息先更新到本地数据库
    // 可能导致的问题：初始化信息的行为与后端不一致

    const current = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const createdTag = {
      tag: cacheTagName,
      iconId: 0,
      url: '',
      creatorId: userInfoStore.info.id,
      createTime: current,
      updaterId: userInfoStore.info.id,
      updateTime: current,
      typeIdList: [],
      version: 1,
    }
    await db.iconTag.put(createdTag)

    return createdTag
  },
})

onSuccess((tag) => {
  ElMessage.success({
    message: '新建图标成功',
    offset: 48,
  })
  emits('success', tag)
  GlobalDialogController.close()
})

onError((err) => {
  ElMessage.error({
    message: `新建图标失败，原因为：${err.message}`,
    offset: 48,
  })
})

const cancel = () => {
  if (loading.value)
    return
  GlobalDialogController.close()
}

const tabs: { key: string; name: string }[] = [
  { key: 'base', name: '基本信息' },
]
const activedTabKey = ref('base')
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar
      :disabled="loading"
      @close="cancel"
    >
      新建图标
    </WinDialogTitleBar>

    <WinDialogTabPanel
      v-model:tab-key="activedTabKey"
      :tabs="tabs"
      :tabs-disabled="loading"
      class="w-[370px]"
    >
      <el-input v-model="tagName" class="col-span-2" placeholder="请输入图标名称">
        <template #prefix>
          <span class="text-xs text-[var(--el-color-danger)] select-none">
            *
          </span>
        </template>
        <template #suffix>
          <span class="text-xs select-none" :class="!tagName.length ? 'text-[var(--el-color-danger)]' : ''">
            {{ tagName.length }} / {{ LENGTH_LIMIT }}
          </span>
        </template>
      </el-input>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button
        type="primary"
        :icon="Check"
        :loading="loading"
        :disabled="tagName.length === 0"
        @click="createTag"
      >
        确认
      </el-button>
      <el-button
        :icon="Close"
        :disabled="loading"
        @click="cancel"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
