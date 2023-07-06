import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import Oauth from '@/api/oauth'
import { Logger, messageFrom } from '@/utils'
import { router } from '@/router'
import { RoleTypeEnum } from '@/shared'
import {
  useArchiveStore,
  useAreaStore,
  useIconTagStore,
  useItemStore,
  useItemTypeStore,
  useMarkerStore,
} from '@/stores'
import type { UserPreference } from '@/database/appdatabase'
import db from '@/database'

export interface UserAuth extends API.SysToken {
  expires_time: number
}

const logger = new Logger('[user store]')

/** 具有打点权的角色 */
const ACCESSABLE_ROLES = [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER, RoleTypeEnum.MAP_NEIGUI, RoleTypeEnum.MAP_PUNCTUATE]
/** 属于管理员的角色 */
const ADMIN_ROLES = [RoleTypeEnum.ADMIN, RoleTypeEnum.MAP_MANAGER]
/** token 刷新的阈值时间 */
const TOKEN_REFRESH_REST_TIME = import.meta.env.VITE_TOKEN_REFRESH_REST_TIME * 1000

/** 持久化存储的用户信息 */
const localUserInfo = useLocalStorage<API.SysUserVo>('__ys_user_info', {})
/** 持久化存储的鉴权信息 */
const localUserAuth = useLocalStorage<Partial<UserAuth>>('__ys_dadian_auth', {})
/** 鉴权刷新计时器 */
const intervalRefreshTimer = ref<number>()

/** 计算 token 到期时间 */
const getExpiressTime = (expiressIn: number) => Date.now() + expiressIn * 1000

/** 计算 token 剩余有效时间 */
const getRestTime = (expiressTime: number) => new Date(expiressTime).getTime() - Date.now()

/** 计算 token 剩余有效时间与设定刷新阈值时间的差 */
const differenceTokenTime = (expiressTime: number) => getRestTime(expiressTime) - TOKEN_REFRESH_REST_TIME

export const useUserStore = defineStore('user-info', {
  state: () => ({
    /** 用户鉴权信息 */
    auth: localUserAuth.value,
    /** 用户基本信息 */
    info: localUserInfo.value,
    /** 用户本地设置 */
    preference: {} as UserPreference,
    /** 是否正在进行预加载任务 */
    isHandling: false,
    /** 路由是否跳转完毕 */
    isRouteLoading: false,
    /** 路由动画是否已经结束 */
    isRouteAnimationEnd: true,
    /** 是否显示用户中心卡片 */
    showUserInfo: false,
  }),
  getters: {
    /** 是否显示加载面板 */
    showLoadingPanel: (state) => {
      const route = useRoute()
      return route.meta.preload && (state.isHandling || state.isRouteLoading || !state.isRouteAnimationEnd)
    },
    /** TODO: 等后端返回改为单角色后就不需要这个了 */
    role: (state) => {
      return state.auth.userRoles?.[0]
    },
    /** 用户是否具有打点权 */
    hasPunctauteRights: ({ auth: { userRoles = [] } }) => {
      return userRoles.some(role => ACCESSABLE_ROLES.includes(role as RoleTypeEnum))
    },
    /** 用户是否为管理员 */
    isAdmin: ({ auth: { userRoles = [] } }) => {
      return userRoles.some(role => ADMIN_ROLES.includes(role as RoleTypeEnum))
    },
    /** 用户是否为测试打点员 */
    isNeigui: ({ auth: { userRoles = [] } }) => {
      return userRoles.includes(RoleTypeEnum.MAP_NEIGUI)
    },
    isOfflineMode: () => import.meta.env.VITE_DEVELOPMENT_MODE === 'offline',
    /** 根据权限筛选出的全部可访问路由，只能在 router 以外的地方调用 */
    routes: (state) => {
      const router = useRouter()
      const { userRoles = [] } = state.auth
      if (!userRoles.length)
        return []
      return router.getRoutes().filter(record => record.meta?.roles?.includes(userRoles[0] ?? '') ?? true)
    },
    /** 根据权限筛选出的一级菜单的路由 */
    menuRoutes: (state) => {
      const router = useRouter()
      const routes = router.getRoutes().find(item => item.path === '/')?.children ?? []
      const { userRoles = [] } = state.auth
      if (!userRoles.length)
        return []
      return routes.filter(record => record.meta?.roles?.includes(userRoles[0] ?? '') ?? true)
    },
  },
  actions: {
    /** 创建自动刷新鉴权信息的定时器 */
    createRefreshTimer() {
      try {
        if (intervalRefreshTimer.value !== undefined)
          return logger.info('已存在刷新任务，将会重用')
        const { expires_time } = this.auth
        if (!expires_time)
          throw new Error('expires_time is invalid')
        const refreshInterval = differenceTokenTime(expires_time)
        if (refreshInterval < 0)
          throw new Error('token 已过期')
        logger.info(`已建立 token 刷新定时任务，剩余 ${(refreshInterval / 1000).toFixed(1)} s`)
        intervalRefreshTimer.value = window.setTimeout(async () => {
          await this.refreshAuth()
          this.clearRefreshTimer()
          this.createRefreshTimer()
        }, refreshInterval)
      }
      catch (err) {
        logger.error(messageFrom(err))
      }
    },
    /** 清除自动刷新鉴权信息的任务，在登出时可能需要调用该方法 */
    clearRefreshTimer() {
      window.clearTimeout(intervalRefreshTimer.value)
      intervalRefreshTimer.value = undefined
    },
    /** 检查 token 是否有效 */
    validateUserToken(): boolean {
      const { access_token, expires_time } = this.auth
      if (!access_token || !expires_time)
        return false
      return access_token.length > 0 && expires_time > Date.now()
    },
    /** 设置鉴权信息 */
    setAuth(auth: API.SysToken) {
      const userAuth: UserAuth = {
        ...auth,
        expires_time: getExpiressTime(auth.expires_in),
      }
      this.auth = userAuth
      localUserAuth.value = userAuth
    },
    /** 刷新鉴权信息 */
    async refreshAuth() {
      try {
        if (!this.auth.refresh_token || this.auth.expires_time === undefined)
          throw new Error('刷新 token 所需的凭证信息为空')
        const auth = await Oauth.oauth.refresh({
          grant_type: 'refresh_token',
          refresh_token: this.auth.refresh_token,
        })
        this.setAuth(auth)
      }
      catch (err) {
        logger.error('刷新 token 失败，原因为：', messageFrom(err))
      }
    },
    /** 登出并清理鉴权信息 */
    logout() {
      // 清除后台任务
      this.clearRefreshTimer()
      useAreaStore().clearBackgroundUpdate()
      useIconTagStore().clearBackgroundUpdate()
      useItemStore().clearBackgroundUpdate()
      useItemTypeStore().clearBackgroundUpdate()
      useMarkerStore().clearBackgroundUpdate()
      // 重置内存状态
      localUserAuth.value = {}
      localUserInfo.value = {}
      this.$reset()
      useArchiveStore().$reset()
      router.push('/login')
    },
    /** 更新用户信息 */
    async updateUserInfo() {
      try {
        if (!this.auth.userId)
          throw new Error('用户 id 为空')
        const { data = {} } = await Api.sysUserController.getUserInfo({ userId: this.auth.userId })
        this.info = data
        localUserInfo.value = data
      }
      catch (err) {
        ElMessage.error(`更新用户信息失败，原因为：${messageFrom(err)}`)
      }
    },
    async updateUserPreference() {
      if (this.info.id === undefined)
        return
      const userPreference = await db.user.get(this.info.id)
      this.preference = userPreference ?? {}
    },
    /** 预加载任务，仅在 token 可用时或登陆后运行 */
    async preloadMission() {
      if (!this.validateUserToken() || this.isHandling || this.isOfflineMode)
        return
      this.isHandling = true
      try {
        await Promise.allSettled([
          useAreaStore().backgroundUpdate(),
          useItemStore().backgroundUpdate(),
          useItemTypeStore().backgroundUpdate(),
          useMarkerStore().backgroundUpdate(),
          useIconTagStore().backgroundUpdate(),
        ])
      }
      finally {
        this.isHandling = false
      }
    },
    /** 向本地数据库同步用户设置 */
    async syncUserPreference() {
      try {
        if (this.info.id === undefined)
          return
        const payload = {
          id: this.info.id,
          ...JSON.parse(JSON.stringify(this.preference)),
        }
        await db.user.put(payload)
      }
      catch (err) {
        ElMessage.error(messageFrom(err))
      }
    },
  },
})
