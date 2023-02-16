import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import System from '@/api/system'
import Oauth from '@/api/oauth'
import { Logger, messageFrom } from '@/utils'
import { router } from '@/router'
import { RoleTypeEnum } from '@/shared'
import { useMapStore } from '@/stores'

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
const getExpriesTime = (expiressIn: number) => {
  return new Date().getTime() + 1000 * expiressIn
}

/** 计算 token 剩余有效时间 */
const getRestTime = (expiresTime: number) => {
  return new Date(expiresTime).getTime() - new Date().getTime()
}

/** 计算 token 剩余有效期与设定刷新阈值时间的差 */
const differenceTokenTime = (expiresTime: number) => {
  return Math.min(getRestTime(expiresTime) - TOKEN_REFRESH_REST_TIME, 1200000)
}

export const useUserStore = defineStore('user-info', {
  state: () => ({
    auth: localUserAuth.value,
    info: localUserInfo.value,
  }),
  getters: {
    /** TODO: 等后端返回改为单角色后就不需要这个了 */
    role: (state) => {
      return state.info.roleList?.[0]
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
    /** 根据权限筛选出的全部可访问路由，只能在 router 以外的地方调用 */
    routes: (state) => {
      const router = useRouter()
      const { roleList = [] } = state.info
      if (!roleList.length)
        return []
      return router.getRoutes().filter(record => record.meta?.roles?.includes(roleList[0]?.code ?? '') ?? true)
    },
    /** 根据权限筛选出的一级菜单的路由 */
    menuRoutes: (state) => {
      const router = useRouter()
      const routes = router.getRoutes().find(item => item.path === '/')?.children ?? []
      const { roleList = [] } = state.info
      if (!roleList.length)
        return []
      return routes.filter(record => record.meta?.roles?.includes(roleList[0]?.code ?? '') ?? true)
    },
  },
  actions: {
    /**
     * 创建自动刷新鉴权信息的定时器
     * @注意 在重复调用时会优先复用定时器，保证在有效期内定时器的唯一性
     * @fixme 挂机时间过长时会出现奇怪的 bug
     */
    async createRefreshTimer() {
      if (intervalRefreshTimer.value !== undefined) {
        logger.info('已存在刷新任务，将会重用')
        return
      }
      const { expires_time } = this.auth
      if (!expires_time) {
        logger.error('无法获取刷新 token 所必须的信息: expires_time is invalid')
        return
      }
      const refreshInterval = differenceTokenTime(expires_time)
      if (refreshInterval < 0) {
        logger.error('token 剩余有效期小于 0')
        return
      }
      logger.info(`已建立 token 刷新定时任务，剩余 ${(refreshInterval / 1000).toFixed(1)} s`)
      intervalRefreshTimer.value = window.setTimeout(async () => {
        await this.refreshAuth()
        this.clearRefreshTimer()
        this.createRefreshTimer()
      }, refreshInterval)
    },
    /** 清除自动刷新鉴权信息的任务，在登出时可能需要调用该方法 */
    clearRefreshTimer() {
      window.clearTimeout(intervalRefreshTimer.value)
      intervalRefreshTimer.value = undefined
    },
    /** 检查 token 是否有效 */
    validateUserToken() {
      const { access_token, expires_time } = this.auth
      if (!access_token || !expires_time)
        return false
      return access_token && expires_time > new Date().getTime()
    },
    /** 设置鉴权信息 */
    setAuth(auth: API.SysToken) {
      const userAuth: UserAuth = {
        ...auth,
        expires_time: getExpriesTime(auth.expires_in),
      }
      this.auth = userAuth
      localUserAuth.value = userAuth
    },
    /** 刷新鉴权信息 */
    async refreshAuth() {
      if (!this.auth.refresh_token || !this.auth.expires_time)
        return
      // 剩余时间小于一定范围时才刷新
      if (differenceTokenTime(this.auth.expires_time) > 0)
        return
      try {
        const auth = await Oauth.oauth.refresh({
          grant_type: 'refresh_token',
          refresh_token: this.auth.refresh_token,
        })
        this.setAuth(auth)
      }
      catch (err) {
        logger.error('刷新 token 失败', err)
      }
    },
    /** 登出并清理鉴权信息 */
    logout() {
      this.auth = {}
      this.info = {}
      localUserAuth.value = null
      localUserInfo.value = null
      this.clearRefreshTimer()
      // 清除地图参数
      useMapStore().reset()
      router.push('/login')
    },
    /** 登录（密码模式） */
    async login(loginForm: API.SysTokenVO) {
      const auth = await Oauth.oauth.token(loginForm)
      this.setAuth(auth)
    },
    /** 更新用户信息 */
    async updateUserInfo() {
      if (!this.auth.userId)
        return
      try {
        const { data = {} } = await System.sysUserController.getUserInfo({ userId: this.auth.userId })
        this.info = data
        localUserInfo.value = data
      }
      catch (err) {
        ElMessage.error(messageFrom(err))
      }
    },
  },
})
