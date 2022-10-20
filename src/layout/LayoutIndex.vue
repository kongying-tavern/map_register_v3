<script lang="ts" setup>
import { AppSidemenu, BreadCrumb } from '@/components'
import { LayoutAside, LayoutHeader, LayoutPage } from '@/layout'
import { useAuthInfo } from '@/utils'

const router = useRouter()

const handleCommand = (command: string) => {
  const authInfo = useAuthInfo()
  if (command === 'logout') {
    authInfo.value = null
    router.push('/login')
  }
}
</script>

<template>
  <div class="layout-contianer w-full h-full grid overflow-hidden">
    <LayoutAside>
      <template #header>
        <div class="h-full grid place-items-center text-sm">
          管理系统
        </div>
      </template>
      <AppSidemenu />
    </LayoutAside>

    <LayoutHeader>
      <div class="h-full flex-1 flex items-center justify-between text-sm px-4">
        <BreadCrumb />
        <el-dropdown @command="handleCommand">
          <el-avatar :size="36" src="https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                退出账户
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </LayoutHeader>

    <LayoutPage />
  </div>
</template>

<style lang="scss" scoped>
// TODO: 变量抽离
.layout-contianer {
  --c-bg-color: #fff;
  --c-aside-width: 120px;
  --c-aside-shadow: 0 2px 8px #1d23290d;
  --c-header-height: 60px;
  --c-header-shdow: 2px 0 8px #1d23290d;

  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
}
</style>
