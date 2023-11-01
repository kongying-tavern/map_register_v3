/* eslint-disable */

declare namespace API {
  interface RDriveUploadResult {
    code: number
    message?: string
    data?: {
      /** 上传成功后的 url */
      url?: string
    }
  }

  /** 登录信息 */
  interface RDriveToken {
    code: number
    message?: string
    data?: {
      token?: string
    }
  }

  /** 图片上传所需参数 */
  interface AliyunDriveUploadVO {
    /** 图片（单文件） */
    file: File
    /** 上传全路径 */
    path: string
    /** 文件夹密码 */
    password?: string
    /** token */
    authorization: string
  }

  interface DriveUploadOptions {
    onProgress?: (progress: number) => void
  }
}
