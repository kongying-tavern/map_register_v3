/** 设备状态（用于配置权限策略） */
export enum DeviceStatus {
  /** 默认 */
  UNKNOWN = 0,

  /** 允许 */
  VALID = 1,

  /** 拦截 */
  BLOCKED = 2,
}

/** 设备状态名称表 */
export const DEVICE_STATUS_NAME_MAP: Record<number, string> = {
  [DeviceStatus.UNKNOWN]: '默认',
  [DeviceStatus.VALID]: '允许',
  [DeviceStatus.BLOCKED]: '拦截',
}
