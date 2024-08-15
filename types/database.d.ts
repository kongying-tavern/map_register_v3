/** 用户存档的本地数据结构 */
interface UserArchiveBody {
  id: number
  body: {
    Data_KYJG: number[]
    Time_KYJG: Record<number, string>
  }
  timestamp: number
}
