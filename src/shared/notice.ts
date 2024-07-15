/** 公告频道 */
export enum NoticeChannel {
  /** 全部频道 */
  COMMON = 'COMMON',

  /** 前台全部 */
  APPLICATION = 'APPLICATION',

  /** 前台 - 移动端 */
  CLIENT_APP = 'CLIENT_APP',

  /** 前台 - PC 端 */
  CLIENT_PC = 'CLIENT_PC',

  /** 前台 - Web 端 */
  WEB = 'WEB',

  /** 后台全部 */
  DASHBOARD = 'DASHBOARD',

  /** 后台 - 打点页 */
  DADIAN = 'DADIAN',

  /** 维系天理 */
  TIANLI = 'TIANLI',
}

export const NOTICE_NAME_MAP = new Map<string, string>([
  [NoticeChannel.COMMON, '全部'],
  [NoticeChannel.APPLICATION, '前台'],
  [NoticeChannel.CLIENT_APP, '前台 - 移动端'],
  [NoticeChannel.CLIENT_PC, '前台 - PC端'],
  [NoticeChannel.WEB, '前台 - Web端'],
  [NoticeChannel.DASHBOARD, '后台'],
  [NoticeChannel.DADIAN, '后台 - 打点页'],
  [NoticeChannel.TIANLI, '维系天理'],
])
