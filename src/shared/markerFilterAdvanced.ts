import {
  IconApplication,
  IconArrowDottedNeSw,
  IconDocument,
  IconDocumentRegex,
  IconEye,
  IconImage,
  IconLayers,
  IconLayersFilled,
  IconLink,
  IconPackage,
  IconPackageList,
  IconPackageRegex,
  IconPackageTimesNumber,
  IconPound,
  IconTimer,
  IconTitleSerif,
  IconVideoPlay,
} from '@/components/AppIcons'
import { MapLocation } from '@element-plus/icons-vue'

export enum MAFModelId {
  /** 基础字段 */
  ID_RANGE = 1,
  TITLE_CONTAIN = 2,
  CONTENT_CONTAIN = 3,
  CONTENT_REGEX = 4,
  IMAGE = 5,
  VIDEO = 6,
  REFRESH_TIME = 7,
  VISIBILITY = 8,

  /** 点位相关 */
  AREA = 101,
  ITEM_TYPE = 102,
  ITEM_NAME = 103,
  ITEM_NAME_REGEX = 104,
  ITEM_SIZE = 105,
  ITEM_COUNT = 106,

  /** 分层相关 */
  UNDERGROUND = 201,
  UNDERGROUND_LAYER = 202,

  /** 点位关联相关 */
  LINKAGE = 301,
  LINKAGE_ACTION = 302,
}

export const MAF_MODEL_NAME_MAP: Record<MAFModelId, string> = {
  /** 基础字段 */
  [MAFModelId.ID_RANGE]: 'ID范围',
  [MAFModelId.TITLE_CONTAIN]: '标题包含',
  [MAFModelId.CONTENT_CONTAIN]: '内容包含',
  [MAFModelId.CONTENT_REGEX]: '内容正则匹配',
  [MAFModelId.IMAGE]: '点位图片',
  [MAFModelId.VIDEO]: '点位视频',
  [MAFModelId.REFRESH_TIME]: '刷新时间',
  [MAFModelId.VISIBILITY]: '可见范围',

  /** 点位相关 */
  [MAFModelId.AREA]: '地区',
  [MAFModelId.ITEM_TYPE]: '类别',
  [MAFModelId.ITEM_NAME]: '物品名称',
  [MAFModelId.ITEM_NAME_REGEX]: '物品名称正则',
  [MAFModelId.ITEM_SIZE]: '物品条数',
  [MAFModelId.ITEM_COUNT]: '物品计数',

  /** 分层相关 */
  [MAFModelId.UNDERGROUND]: '地面点位',
  [MAFModelId.UNDERGROUND_LAYER]: '分层层级',

  /** 点位关联相关 */
  [MAFModelId.LINKAGE]: '点位关联',
  [MAFModelId.LINKAGE_ACTION]: '点位关联类型',
}

export const MAF_MODEL_ICON_MAP: Record<MAFModelId, Component> = {
  /** 基础字段 */
  [MAFModelId.ID_RANGE]: IconPound,
  [MAFModelId.TITLE_CONTAIN]: IconTitleSerif,
  [MAFModelId.CONTENT_CONTAIN]: IconDocument,
  [MAFModelId.CONTENT_REGEX]: IconDocumentRegex,
  [MAFModelId.IMAGE]: IconImage,
  [MAFModelId.VIDEO]: IconVideoPlay,
  [MAFModelId.REFRESH_TIME]: IconTimer,
  [MAFModelId.VISIBILITY]: IconEye,

  /** 点位相关 */
  [MAFModelId.AREA]: MapLocation,
  [MAFModelId.ITEM_TYPE]: IconApplication,
  [MAFModelId.ITEM_NAME]: IconPackage,
  [MAFModelId.ITEM_NAME_REGEX]: IconPackageRegex,
  [MAFModelId.ITEM_SIZE]: IconPackageList,
  [MAFModelId.ITEM_COUNT]: IconPackageTimesNumber,

  /** 分层相关 */
  [MAFModelId.UNDERGROUND]: IconLayers,
  [MAFModelId.UNDERGROUND_LAYER]: IconLayersFilled,

  /** 点位关联相关 */
  [MAFModelId.LINKAGE]: IconLink,
  [MAFModelId.LINKAGE_ACTION]: IconArrowDottedNeSw,
}
