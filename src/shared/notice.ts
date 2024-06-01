/** 公告频道 */
export enum NoticeChannel {
  /** 通用 */
  COMMON = 'COMMON',

  /** 前台（应用端） */
  APPLICATION = 'APPLICATION',

  /** App客户端 */
  CLIENT_APP = 'CLIENT_APP',

  /** PC客户端 */
  CLIENT_PC = 'CLIENT_PC',

  /** 网页版 */
  WEB = 'WEB',

  /** 后台（管理面板） */
  DASHBOARD = 'DASHBOARD',

  /** 打点页 */
  DADIAN = 'DADIAN',

  /** 维系天理 */
  TIANLI = 'TIANLI',
}

export const NOTICE_NAME_MAP = new Map<string, string>([
  [NoticeChannel.APPLICATION, '前台'],
  [NoticeChannel.CLIENT_APP, 'App客户端'],
  [NoticeChannel.CLIENT_PC, 'PC客户端'],
  [NoticeChannel.COMMON, '通用'],
  [NoticeChannel.DADIAN, '打点页'],
  [NoticeChannel.DASHBOARD, '后台'],
  [NoticeChannel.TIANLI, '维系天理'],
  [NoticeChannel.WEB, '网页版'],
])
