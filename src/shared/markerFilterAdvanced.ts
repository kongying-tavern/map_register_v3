import { MapLocation } from '@element-plus/icons-vue'
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

export interface MAFModelMeta {
  name: string
  icon: Component
}

export const MAF_MODEL_META_MAP: Record<MAFModelId, MAFModelMeta> = {
  /** 基础字段 */
  [MAFModelId.ID_RANGE]: {
    name: 'ID范围',
    icon: IconPound,
  },
  [MAFModelId.TITLE_CONTAIN]: {
    name: '标题包含',
    icon: IconTitleSerif,
  },
  [MAFModelId.CONTENT_CONTAIN]: {
    name: '内容包含',
    icon: IconDocument,
  },
  [MAFModelId.CONTENT_REGEX]: {
    name: '内容正则匹配',
    icon: IconDocumentRegex,
  },
  [MAFModelId.IMAGE]: {
    name: '点位图片',
    icon: IconImage,
  },
  [MAFModelId.VIDEO]: {
    name: '点位视频',
    icon: IconVideoPlay,
  },
  [MAFModelId.REFRESH_TIME]: {
    name: '刷新时间',
    icon: IconTimer,
  },
  [MAFModelId.VISIBILITY]: {
    name: '可见范围',
    icon: IconEye,
  },

  /** 点位相关 */
  [MAFModelId.AREA]: {
    name: '地区',
    icon: MapLocation,
  },
  [MAFModelId.ITEM_TYPE]: {
    name: '类别',
    icon: IconApplication,
  },
  [MAFModelId.ITEM_NAME]: {
    name: '物品名称',
    icon: IconPackage,
  },
  [MAFModelId.ITEM_NAME_REGEX]: {
    name: '物品名称正则',
    icon: IconPackageRegex,
  },
  [MAFModelId.ITEM_SIZE]: {
    name: '物品条数',
    icon: IconPackageList,
  },
  [MAFModelId.ITEM_COUNT]: {
    name: '物品计数',
    icon: IconPackageTimesNumber,
  },

  /** 分层相关 */
  [MAFModelId.UNDERGROUND]: {
    name: '点位分层',
    icon: IconLayers,
  },
  [MAFModelId.UNDERGROUND_LAYER]: {
    name: '分层层级',
    icon: IconLayersFilled,
  },

  /** 点位关联相关 */
  [MAFModelId.LINKAGE]: {
    name: '点位关联',
    icon: IconLink,
  },
  [MAFModelId.LINKAGE_ACTION]: {
    name: '点位关联类型',
    icon: IconArrowDottedNeSw,
  },
}
