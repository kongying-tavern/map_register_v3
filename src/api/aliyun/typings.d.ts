/* eslint-disable */

declare namespace API {
  type RBase = {
    code?: number
    message?: string
    data?: any
  };

  type AliyunDriveDirVO = {
    /** 文件夹路径 */
    path: string
  };

  type AliyunDriveUploadVO = {
    /** 图片文件 */
    files: File
    /** 上传路径 */
    path: string
    /** 文件夹密码 */
    password?: string
  };
}
