import { request } from '@/utils'
import type {
  Response,
  PaginationResponse,
  PaginationRequest,
  Role,
} from '@/api/types'

export interface UserData {
  id: number
  username?: string
  nickname?: string
  qq?: string
  phone?: string
  logoUrl?: string
  roleList?: Role[]
}
export type UserListRes = Response<PaginationResponse<UserData[]>>
export type UserListReq = PaginationRequest & {
  nickname?: string
  sort?: string[]
  username?: string
}

export const fetchUserList = (data: UserListReq) =>
  request.post<UserListRes, UserListRes>('/system/user/info/userList', data)
