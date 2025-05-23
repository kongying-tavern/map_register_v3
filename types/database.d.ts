import type { UserPreference } from '@/stores/types'

/** 用户存档的本地数据结构 */
interface UserArchiveBody {
  /** 存档的用户 id */
  id: number
  body: {
    Data_KYJG: number[]
    Time_KYJG: Record<number, string>
    Preference: UserPreference
  }
  timestamp: number
}

interface ScoreGeneratedCache {
  /**
   * 遵循如下格式
   * ```
   * ${Timestamp}-${TimeStamp}
   * ```
   */
  id: string
}

type Hash<T> = T & {
  __hash?: string
}
