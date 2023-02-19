/* eslint-disable */

declare namespace API {
  type RBase = {
    code?: number
    message?: string
    data?: any
  };

  type RDriveToken = {
    code?: number
    message?: string
    data?: {
      token?: string
    }
  }

  type AliyunDriveUploadVO = {
    /** 图片（单文件） */
    file: File
    /** 上传全路径 */
    path: string
    /** 文件夹密码 */
    password?: string
    /** token */
    authorization: string
  };
}
