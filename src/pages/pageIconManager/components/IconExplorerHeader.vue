<script setup lang="ts">
import { ArrowDown, CircleCheck, CirclePlus, Sort } from '@element-plus/icons-vue'
import { TagCreator } from '.'
import { useGlobalDialog } from '@/hooks'

const emits = defineEmits<{
  createTagSuccess: [tag: API.TagVo]
}>()

const queryTagName = defineModel<string>('queryTagName', {
  required: true,
})

const queryTagType = defineModel<API.TagTypeVo>('queryTagType', {
  required: true,
})

const sortInfo = defineModel<Record<string, string>>('sortInfo', {
  required: true,
})

const sortOptions: { role: 'key' | 'type'; value: string; name: string; divided?: boolean }[] = [
  { role: 'key', value: 'tag', name: '名称' },
  { role: 'key', value: 'iconId', name: '图片 id' },
  { role: 'key', value: 'createTime', name: '创建时间' },
  { role: 'key', value: 'updateTime', name: '修改时间' },
  { role: 'type', value: '+', name: '正序', divided: true },
  { role: 'type', value: '-', name: '倒序' },
]

function handleSortCommand(command: string) {
  const [key, value] = command.split(':')
  Reflect.set(sortInfo.value, key, value)
}

const { DialogService } = useGlobalDialog()

const openTagCreatorDialog = () => {
  DialogService
    .config({
      width: 'fit-content',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      alignCenter: true,
    })
    .listeners({
      success: (tag: API.TagVo) => emits('createTagSuccess', tag),
    })
    .open(TagCreator)
}
</script>

<template>
  <div class="col-span-3 flex justify-end items-center p-2 border-b-[1px] border-[var(--el-border-color-lighter)]">
    <el-input v-model="queryTagName" style="max-width: 300px" :placeholder="`在 ${queryTagType.name} 中搜索`">
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <el-divider direction="vertical" />

    <el-dropdown :hide-on-click="false" @command="handleSortCommand">
      <el-button text :icon="Sort">
        排序
        <el-icon class="el-icon--right" :size="12">
          <ArrowDown />
        </el-icon>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="option in sortOptions"
            :key="option.value"
            :command="`${option.role}:${option.value}`"
            :divided="option.divided"
          >
            <div class="flex items-center gap-2">
              <el-icon class="transition-all" :class="{ 'opacity-0': sortInfo[option.role] !== option.value }" :size="12">
                <CircleCheck />
              </el-icon>
              <div>{{ option.name }}</div>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-divider direction="vertical" />

    <el-button text :icon="CirclePlus" @click="openTagCreatorDialog">
      新建
    </el-button>
  </div>
</template>
