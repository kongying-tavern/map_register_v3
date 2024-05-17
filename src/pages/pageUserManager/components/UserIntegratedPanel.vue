<script setup lang="ts">
import { CircleCheck, Delete, PictureFilled, RefreshLeft } from '@element-plus/icons-vue'
import { usePasswordUpdate, useUserEdit } from '../hooks'
import UserDeleteConfirm from './UserDeleteConfirm.vue'
import UserDevice from './UserDevice.vue'
import UserKickoutConfirm from './UserKickoutConfirm.vue'
import UserPasswordEditor from './UserPasswordEditor.vue'
import { ExitLeft } from '@/components/GenshinUI/GSIcon'
import { GlobalDialogController, WinDialog, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useUserInfoStore } from '@/stores'
import { ACCESS_POLICY_OPTIONS } from '@/shared'

const props = defineProps<{
  data: API.SysUserVo
  roleMap: Map<number, API.SysRoleVo>
  roleList: API.SysRoleVo[]
}>()

const emits = defineEmits<{
  success: []
}>()

const userInfoStore = useUserInfoStore()

// ==================== 面板状态 ====================
/** 当前打开的面板是否为自己 */
const isYourSelf = computed(() => userInfoStore.info.id === props.data.id)

/** 面板任务处理状态 */
const panelLoading = ref(false)

/** 用户操作类型 */
const action = ref('')

/** 详情面板可用 tab */
const tabs = [
  { key: 'baseinfo', name: '基本信息' },
  { key: 'password', name: '修改密码' },
  { key: 'device', name: '设备管理' },
]

/** 详情面板当前激活 tab */
const tabKey = ref('baseinfo')

const onDeleteSuccess = () => {
  emits('success')
  GlobalDialogController.close()
}

// ==================== 修改信息 ====================
const useInfoRaw = ref<API.SysUserVo>(JSON.parse(JSON.stringify(props.data)))

const userInfoForm = ref<API.SysUserVo>(JSON.parse(JSON.stringify(props.data)))

const isChanged = computed(() => JSON.stringify(userInfoForm.value) !== JSON.stringify(useInfoRaw.value))

const resetUserInfo = () => {
  userInfoForm.value = JSON.parse(JSON.stringify(props.data))
}

const { submit, onSuccess: onEditSuccess } = useUserEdit(userInfoForm, {
  loading: panelLoading,
})

onEditSuccess(() => {
  useInfoRaw.value = JSON.parse(JSON.stringify(userInfoForm.value))
  emits('success')
})

// ==================== 修改密码 ====================
const passwordForm = ref<API.SysUserPasswordUpdateVo>({
  userId: props.data.id,
  password: '',
})

const { submit: submitPwsUpdate, loading: pwdUpdateLoading } = usePasswordUpdate(passwordForm, {
  loading: panelLoading,
})
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="panelLoading" @close="GlobalDialogController.close">
      用户详情
    </WinDialogTitleBar>

    <WinDialogTabPanel
      v-model:tab-key="tabKey"
      :tabs="tabs"
      :tabs-disabled="panelLoading"
      class="mb-2 w-96 h-[480px]"
      style="padding: 0"
    >
      <div v-if="tabKey === 'baseinfo'" class="p-4">
        <div class="flex gap-4">
          <div class="w-32 h-32 border border-[var(--el-border-color)] rounded-sm grid place-items-center flex-shrink-0">
            <img v-if="data.logo" :src="data.logo" class="w-full h-full object-contain" referrerpolicy="no-referrer">
            <div v-else class="grid place-items-center text-[var(--el-text-color-secondary)]">
              <el-icon :size="32">
                <PictureFilled />
              </el-icon>
              <div>No image</div>
            </div>
          </div>

          <div class="flex-1 w-full flex flex-col">
            <div>ID: {{ data.id }}</div>
            <div>账号: {{ data.username }}</div>
            <div v-if="!isYourSelf" class="flex-1 flex justify-start items-end">
              <el-button
                :icon="Delete"
                type="danger"
                text
                title="删除用户"
                style="padding: 8px 10px"
                @click="action = 'delete'"
              >
                删除
              </el-button>
              <el-button
                :icon="ExitLeft"
                type="danger"
                text
                title="让该用户退出登录"
                style="padding: 8px 10px"
                @click="action = 'kickout'"
              >
                注销
              </el-button>
            </div>
          </div>
        </div>

        <el-divider style="margin: 16px 0;" content-position="left">
          编辑信息
        </el-divider>

        <el-form :model="userInfoForm" label-width="80px">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="userInfoForm.nickname" placeholder="最好有一个" />
          </el-form-item>

          <el-form-item label="角色" prop="roleId">
            <el-select-v2
              v-model="userInfoForm.roleId"
              :options="roleList"
              :props="{
                label: 'name',
                value: 'id',
              }"
            />
          </el-form-item>

          <el-form-item label="权限策略" prop="accessPolicy">
            <el-select-v2
              v-model="userInfoForm.accessPolicy"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :options="ACCESS_POLICY_OPTIONS"
              clearable
            />
          </el-form-item>

          <el-form-item label="QQ" prop="qq">
            <el-input v-model="userInfoForm.qq" placeholder="选填" />
          </el-form-item>

          <el-form-item label="手机" prop="phone">
            <el-input v-model="userInfoForm.phone" placeholder="选填" />
          </el-form-item>
        </el-form>

        <div class="flex justify-end">
          <el-button :icon="CircleCheck" :loading="panelLoading" :disabled="!isChanged" type="primary" @click="submit">
            保存
          </el-button>
          <el-button :icon="RefreshLeft" :disabled="!isChanged || panelLoading" @click="resetUserInfo">
            重置
          </el-button>
        </div>
      </div>

      <div v-else-if="tabKey === 'password'" class="p-4">
        <UserPasswordEditor
          v-model="passwordForm"
          :loading="pwdUpdateLoading"
          @submit="submitPwsUpdate"
        />
      </div>

      <UserDevice
        v-else-if="tabKey === 'device'"
        v-model:loading="panelLoading"
        :data="useInfoRaw"
      />
    </WinDialogTabPanel>

    <UserKickoutConfirm
      v-model:action="action"
      :data="useInfoRaw"
    />

    <UserDeleteConfirm
      v-model:action="action"
      :data="useInfoRaw"
      @success="onDeleteSuccess"
    />
  </WinDialog>
</template>
