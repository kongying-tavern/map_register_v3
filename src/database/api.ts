import AppDatabaseBulkPutWorker from './bulkPutWorker?worker'

/** 用于在 worker 批量更新数据的特殊 api */
export class AppDatabaseApi {
  static worker = new AppDatabaseBulkPutWorker()

  static sendMessage = <T>(msg: T) => new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel()
    channel.port2.onmessage = (ev: MessageEvent<string | void>) => {
      ev.data ? reject(new Error(ev.data)) : resolve()
      channel.port1.close()
      channel.port2.close()
    }
    this.worker.postMessage(msg, [channel.port1])
  })

  static marker = {
    bulkPut: (markers: API.MarkerVo[]) => this.sendMessage({
      table: 'marker',
      data: markers,
    }),
  }

  static area = {
    bulkPut: (areas: API.AreaVo[]) => this.sendMessage({
      table: 'area',
      data: areas,
    }),
  }

  static item = {
    bulkPut: (items: API.ItemVo[]) => this.sendMessage({
      table: 'item',
      data: items,
    }),
  }

  static itemType = {
    bulkPut: (itemTypes: API.ItemTypeVo[]) => this.sendMessage({
      table: 'itemType',
      data: itemTypes,
    }),
  }

  static iconTag = {
    bulkPut: (iconTags: API.TagVo[]) => this.sendMessage({
      table: 'iconTag',
      data: iconTags,
    }),
  }
}
