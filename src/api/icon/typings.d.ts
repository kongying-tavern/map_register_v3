declare namespace API {
  type RIconUpload = {
    status?: boolean
    msg?: string
    err_info?: string
    path?: string
  }

  type IconUploadVo = {
    file_name: string
    file_data: File
  }
}