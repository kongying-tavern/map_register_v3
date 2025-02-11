declare namespace Socket {
  interface DataEventMap extends API.WSEventMap {
    ItemAdded: [API.ItemVo, API.SysUserSmallVo]
    ItemUpdated: [API.ItemVo, API.SysUserSmallVo]
    ItemDeleted: [API.ItemVo, API.SysUserSmallVo]

    MarkerAdded: [API.MarkerVo, API.SysUserSmallVo]
    MarkerUpdated: [API.MarkerVo, API.SysUserSmallVo]
    MarkerDeleted: [API.MarkerVo, API.SysUserSmallVo]
    MarkerTweaked: [API.MarkerVo[], API.SysUserSmallVo]
    MarkerLinked: [API.MarkerVo[], API.SysUserSmallVo]
  }

  interface DataEventRecord<K extends keyof DataEventMap = keyof DataEventMap> {
    key: string
    type: K
    user: API.SysUserSmallVo & { id?: number }
    args: DataEventMap[K]
    time: number
  }
}
