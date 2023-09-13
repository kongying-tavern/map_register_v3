import { useFetchHook } from '@/hooks'

export interface MiyousheAvatar {
  id?: number
  name?: string
  sort_order?: number
  icon?: string
}

export interface MiyousheAvatarResponse {
  data?: {
    list?: {
      id?: number
      name?: string
      list?: MiyousheAvatar[]
    }[]
  }
}

/** 头像列表 */
export const useAvatarList = () => {
  const { data: avatarList, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      // TODO 米游社接口，不保证后续可用性
      const res = await fetch('https://bbs-api-static.miyoushe.com/misc/wapi/avatar_set')
      const { data: { list = [] } = {} } = await res.json() as MiyousheAvatarResponse

      // 仅使用原神系列头像
      const avatars = (list.find(avatarGroup => avatarGroup.name === '原神')?.list ?? [])
        .sort(({ sort_order: sa = 0 }, { sort_order: sb = 0 }) => sa - sb)
        .map((avatar) => {
          const name = avatar.name?.replace(/\d/g, '')
          return ({
            ...avatar,
            name: name?.split('-')[0] || '<社区头像>',
          })
        })

      return avatars
    },
    initialValue: [],
  })

  return { avatarList, ...rest }
}
