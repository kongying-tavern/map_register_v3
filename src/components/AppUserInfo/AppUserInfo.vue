<script lang="ts" setup>
import { Avatar } from '@element-plus/icons-vue'
import { ArchiveAnalyser, ArchiveSelector, InfoEditor, PasswordEditor } from '.'
import { useUserStore } from '@/stores'
import { GSTab } from '@/components'
import { ROLES_MAP } from '@/shared'

const userStore = useUserStore()

const tabs: { title: string; value: string }[] = [
  { title: '云存档', value: 'archive' },
  { title: '编辑信息', value: 'info' },
  { title: '修改密码', value: 'password' },
]
const tab = ref('archive')
</script>

<template>
  <el-dialog
    v-model="userStore.showUserInfo"
    :show-close="false"
    align-center
    append-to-body
    width="fit-content"
    class="custom-dialog hidden-header bg-transparent"
  >
    <div class="user-info-dialog relative overflow-visible grid grid-cols-2 place-items-center genshin-text">
      <div class="bg-card rounded" />

      <div class="user-info overflow-hidden rounded flex flex-col items-center p-8 pt-28">
        <div class="banner absolute top-0 left-0 text-center text-xl p-4" />

        <div class="user-avatar w-40 h-40 p-2 flex justify-center items-center">
          <img v-if="userStore.info.logo?.trim()" :src="userStore.info.logo?.trim()" class="w-full h-full rounded-full">
          <Avatar v-else style="background: var(--el-color-info-light-3);" class="rounded-full text-white" />
        </div>

        <div class="w-full flex flex-col items-center p-4">
          <div class="flex items-center gap-2 text-3xl">
            {{ userStore.info.nickname }}
          </div>
          <div class="text-lg" style="color: #7198E3">
            {{ ROLES_MAP[userStore.auth.userRoles?.[0] ?? ''] }}
          </div>
        </div>

        <ArchiveAnalyser />
      </div>

      <div class="user-action w-full h-full p-8 pl-0">
        <GSTab v-model="tab" :tabs="tabs" class="h-full">
          <template #archive>
            <ArchiveSelector />
          </template>
          <template #info>
            <InfoEditor />
          </template>
          <template #password>
            <PasswordEditor />
          </template>
        </GSTab>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.user-info-dialog {
  width: 1200px;
  height: 720px;
  color: #424F65;
  --paint-padding: 2;
  background: paint(user-card-border);
}

.bg-card {
  @keyframes rotateIn2 {
    from { rotate: 5deg }
    to { rotate: -1.5deg }
  }
  position: absolute;
  width: 540px;
  height: calc(100% + 4px);
  top: -2px;
  left: 30px;
  background: #F0EBE3;
  filter: drop-shadow(0 0 12px rgba(150, 150, 150, 0.2));
  animation: rotateIn2 400ms forwards;
}

.user-info {
  @keyframes rotateIn {
    from { rotate: 3deg }
    to { rotate: 0deg }
  }
  width: 540px;
  height: calc(100% + 4px);
  background: paint(user-card-info-border);
  filter: drop-shadow(0 0 12px rgba(150, 150, 150, 0.2));
  animation: rotateIn 400ms forwards;
  position: relative;
}

.banner {
  width: calc(100% - 8px);
  transform: translate(4px, 4px);
  height: 200px;
  background-image: url('https://webstatic.mihoyo.com/upload/static-resource/2023/02/17/2aef4ca8d191bb4a20465f32c2efdd75_7689351784861390069.jpg');
  background-size: cover;
  color: #F0EBE3;
  text-shadow: 0 0 2px #000;
}

.user-avatar {
  border-radius: 50%;
  background: radial-gradient(
    #CE9B76,
    #CE9B76 calc(61% + 2px),
    #F0EBE1 calc(61% + 3px),
    #F0EBE1 calc(61% + 8px),
    #D6C299 calc(61% + 9px),
    #D6C299);
  overflow: hidden;
  position: relative;
  filter: drop-shadow(0 0 6px #00000010);
}

.user-action {
  @keyframes slideIn {
    from {
      translate: -20px 0;
    }
    to {
      translate: 0 0;
    }
  }
  animation: slideIn 400ms forwards;
}
</style>
