/**
 * Protobuf 相关类型定义
 */

/** 点位差异快照 */
export interface MarkerDiffSnapshot {
  id: number
  version: number
}

/** 点位差异快照列表（Protobuf 解码后的格式） */
export interface MarkerDiffSnapshotProtobuf {
  snapshots: MarkerDiffSnapshot[]
}
