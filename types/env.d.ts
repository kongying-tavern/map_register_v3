/// <reference types="vite/client" />

/** 拓展 ENV 环境变量对象的类型 */
interface ImportMetaEnv {
  /** 标题 */
  readonly VITE_TITLE: string

  /** @dev 是否启用 HTTPS */
  readonly VITE_HTTPS?: string

  /** 接口地址 */
  readonly VITE_API_BASE: string

  /** @dev 接口反代理 */
  readonly VITE_API_PROXY_TARGET: string

  /** 路由创建历史记录的模式 */
  readonly VITE_ROUTER_MODE: 'history' | 'hash' | 'memory'

  /** @dev 顶部指示环境的置顶文本 */
  readonly VITE_ENV_BANNER: string

  /** @dev 顶部指示环境标签的可见性 */
  readonly VITE_ENV_BANNER_VISIBLE: 'on' | 'off'

  /** 分支 & 提交 相关环境变量 */
  VITE_COMMIT_BRANCH: string
  VITE_COMMIT_REV_HASH: string

  /** 个人信息面板 banner 展示图 */
  readonly VITE_BANNER_IMAGE: string

  /**
   * token 有效期小于多长时刷新（秒）
   * @default 600
   */
  readonly VITE_TOKEN_REFRESH_REST_TIME: number

  /** @dev 下自动填充用户名 */
  readonly VITE_AUTO_COMPLETE_USERNAME: string

  /** @dev 下自动填充密码 */
  readonly VITE_AUTO_COMPLETE_PASSWORD: string

  /** 阿里云盘地址 */
  readonly VITE_ALIYUN_BASE: string

  /** 云盘图片回显地址 */
  readonly VITE_ALIYUN_IMAGE_BASE: string

  /** 点位图片上传目录 */
  readonly VITE_ALIYUN_MARKER_FOLDER: string

  /** 64 * 64 尺寸图标上传目录 */
  readonly VITE_ALIYUN_ICON_FOLDER: string

  /** 资源服务器地址 */
  readonly VITE_ASSETS_BASE: string

  /** 资源服务器反代理 */
  readonly VITE_ASSETS_PROXY_TARGET: string

  /** @dev 网络模式 */
  readonly VITE_DEVELOPMENT_MODE: 'default' | 'offline'

  /** API 前置账号 */
  readonly VITE_API_AUTH_USERNAME: string

  /** API 前置口令 */
  readonly VITE_API_AUTH_PASSWORD: string

  /** 图床前置账号 */
  readonly VITE_IMG_SERVER_USERNAME: string

  /** 图床前置口令 */
  readonly VITE_IMG_SERVER_PASSWORD: string

  /** WebSocket 地址 */
  readonly VITE_WS_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
