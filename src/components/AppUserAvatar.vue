<script lang="ts" setup>
import { ElIcon, ElImage, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { Avatar, CircleCloseFilled } from '@element-plus/icons-vue'
import { AppLogin } from './AppLogin'
import { AppUserInfo } from './AppUserInfo'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const loginDialogVisible = ref(false)

const handleClick = () => {
  if (userStore.isLogin) {
    userStore.userInfoVisible = true
    return
  }
  loginDialogVisible.value = true
}
</script>

<template>
  <div
    class="map-user-box"
    :title="userStore.info?.nickname"
    @click="handleClick"
  >
    <div class="user-info">
      <template v-if="userStore.isInfoLoading">
        <div class="animate-pulse">
          Loading...
        </div>
      </template>

      <template v-else-if="!userStore.info">
        <div class="text-center">
          -- 未登录 --
        </div>
        <div class="text-center text-[#9DB0D4]">
          部分功能可用
        </div>
      </template>

      <template v-else>
        <div class="text-center w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {{ userStore.info.nickname ?? userStore.info.id }}
        </div>
        <div class="text-center text-[#9DB0D4]">
          {{ userStore.info.role?.name ?? 'unknown' }}
        </div>
      </template>
    </div>

    <div
      class="user-avatar"
      :class="{
        'has-logo': userStore.info?.logo,
      }"
    >
      <ElIcon v-if="!userStore.info?.logo" :size="32" color="#ECE5D8">
        <Avatar />
      </ElIcon>
      <ElImage v-else :src="userStore.info.logo" fit="cover" class="drop-shadow-[0_0_1px_#000000A0]">
        <template #placeholder>
          <ElSkeleton loading animated>
            <template #template>
              <ElSkeletonItem variant="image" style="width: 44px; height: 44px" />
            </template>
          </ElSkeleton>
        </template>
        <template #error>
          <ElIcon :size="32" color="#FF5F40">
            <CircleCloseFilled />
          </ElIcon>
        </template>
      </ElImage>
    </div>

    <AppLogin v-model:visible="loginDialogVisible" />
    <AppUserInfo v-model:visible="userStore.userInfoVisible" />
  </div>
</template>

<style scoped>
.map-user-box {
  @apply
    absolute right-[24px] top-[24px] z-[9]
    flex
    select-none cursor-pointer
  ;
  &:hover {
    filter: drop-shadow(0 0 2px #FF0);
  }
  &:active {
    filter: none;
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
    background: linear-gradient(to left, transparent 24px, #38404FD0 24px);
    mask: linear-gradient(to bottom, transparent 2px, #000 2px, #000 calc(100% - 2px), transparent calc(100% - 2px));
    z-index: -1;
  }
}

.user-avatar {
  @apply
    w-12 h-12 rounded-full overflow-hidden
    grid place-content-center
    bg-gray-500
    border-2 border-[#ECE5D8]
  ;
  &.has-logo {
    background: #DA9241;
  }
}

.user-info {
  @apply
    w-[100px] p-0.5
    grid place-content-center
    text-[#ECE5D8] text-xs
  ;
}
</style>
