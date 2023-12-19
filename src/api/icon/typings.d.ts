declare namespace API {
  interface RIconUpload {
    status?: boolean
    msg?: string
    err_info?: string
    path?: string
  }

  interface IconUploadVo {
    file_name: string
    file_data: File
  }
}
