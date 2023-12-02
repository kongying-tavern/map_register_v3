import _ from "lodash";
import { ref, computed } from "vue";
import { Base64 } from "js-base64";
import JSONPack from "jsonpack";
import { create_notify } from "src/api/common";
import { selectorCollapse } from "src/components/selector-data";
// Filter Models
import FilterModel_001 from "./filter-models/001";
import FilterModel_002 from "./filter-models/002";
import FilterModel_003 from "./filter-models/003";
import FilterModel_004 from "./filter-models/004";
import FilterModel_005 from "./filter-models/005";
import FilterModel_006 from "./filter-models/006";
import FilterModel_007 from "./filter-models/007";
import FilterModel_008 from "./filter-models/008";
import FilterModel_009 from "./filter-models/009";
import FilterModel_010 from "./filter-models/010";
import FilterModel_011 from "./filter-models/011";
import FilterModel_012 from "./filter-models/012";
import FilterModel_013 from "./filter-models/013";
import FilterModel_014 from "./filter-models/014";

export const filterCardVisible = ref(false);

export const filterCacheSelectorCollapse = ref(false);

export const filterMuteTooltip = ref(false);

export const filterCardToggle = (state) => {
  filterCardVisible.value = _.isNil(state)
    ? !filterCardVisible.value
    : Boolean(state);

  if (filterCardVisible.value && !selectorCollapse.value) {
    filterCacheSelectorCollapse.value = selectorCollapse.value;
    selectorCollapse.value = true;
  } else if (!filterCardVisible.value) {
    selectorCollapse.value = filterCardVisible.value;
  }
};

export const filterGroupDefault = {
  joinOperator: "&",
  oppositeValue: false,
  filters: [],
};

export const filterItemDefault = {
  joinOperator: "&",
  oppositeValue: false,
  modelVals: {},
  filterOpts: {},
};

export const filterTypes = [
  FilterModel_001,
  FilterModel_002,
  FilterModel_003,
  FilterModel_004,
  FilterModel_005,
  FilterModel_006,
  FilterModel_007,
  FilterModel_008,
  FilterModel_009,
  FilterModel_010,
  FilterModel_011,
  FilterModel_012,
  FilterModel_013,
  FilterModel_014,
];

export const filterTypesNameMap = _.keyBy(filterTypes, "name");

export const filterTypesIdMap = _.keyBy(filterTypes, "id");

export const filterConfigList = ref([_.cloneDeep(filterGroupDefault)]);

export const filterConfigInit = () => {
  filterConfigList.value = [_.cloneDeep(filterGroupDefault)];
};

export const filterGroupCount = computed(() => filterConfigList.value.length);

export const filterItemCount = computed(() => {
  let filterCountSum = 0;
  for (const filterGroup of filterConfigList.value) {
    const filterList = filterGroup.filters || [];
    const filterCount = filterList.length || 0;

    filterCountSum += filterCount;
  }

  return filterCountSum;
});

const filterGroupCheck = (groupIndex = -1) =>
  Boolean(filterConfigList.value[groupIndex]);

export const filterGroupAdd = (groupIndex = -1) => {
  if (filterGroupCheck(groupIndex)) {
    filterConfigList.value.splice(
      groupIndex + 1,
      0,
      _.cloneDeep(filterGroupDefault)
    );
  } else {
    filterConfigList.value.push(_.cloneDeep(filterGroupDefault));
  }

  filterConfigSave();
};

export const filterGroupDel = (groupIndex = -1) => {
  if (!filterGroupCheck(groupIndex)) {
    return;
  }

  if (filterGroupCount.value <= 1) {
    filterConfigInit();
    filterConfigSave();
    filterCardToggle(false);
    return;
  }

  filterConfigList.value.splice(groupIndex, 1);

  filterConfigSave();
};

export const filterGroupOpposite = (groupIndex = -1) => {
  if (!filterGroupCheck(groupIndex)) {
    return;
  }

  filterConfigList.value[groupIndex].oppositeValue =
    !filterConfigList.value[groupIndex].oppositeValue;

  filterConfigSave();
};

export const filterGroupOpToggle = (groupIndex = -1) => {
  if (!filterGroupCheck(groupIndex)) {
    return;
  }

  const nextOperator =
    filterConfigList.value[groupIndex].joinOperator === "&" ? "|" : "&";
  filterConfigList.value[groupIndex].joinOperator = nextOperator;

  filterConfigSave();
};

const filterItemCheck = (groupIndex = -1, itemIndex = -1, strict = true) => {
  if (!filterGroupCheck(groupIndex)) {
    return false;
  }

  if (!_.isArray(filterConfigList.value[groupIndex].filters)) {
    return false;
  }

  return strict
    ? Boolean(filterConfigList.value[groupIndex].filters[itemIndex])
    : true;
};

export const filterItemAdd = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, false)) {
    return;
  }

  if (filterConfigList.value[groupIndex].filters[itemIndex]) {
    filterConfigList.value[groupIndex].filters.splice(
      itemIndex + 1,
      0,
      _.cloneDeep(filterItemDefault)
    );
  } else {
    filterConfigList.value[groupIndex].filters.push(
      _.cloneDeep(filterItemDefault)
    );
  }

  filterConfigSave();
};

export const filterItemDel = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  filterConfigList.value[groupIndex].filters.splice(itemIndex, 1);

  filterConfigSave();
};

export const filterItemOpposite = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  filterConfigList.value[groupIndex].filters[itemIndex].oppositeValue =
    !filterConfigList.value[groupIndex].filters[itemIndex].oppositeValue;

  filterConfigSave();
};

export const filterItemOpToggle = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  const nextOperator =
    filterConfigList.value[groupIndex].filters[itemIndex].joinOperator === "&"
      ? "|"
      : "&";
  filterConfigList.value[groupIndex].filters[itemIndex].joinOperator =
    nextOperator;

  filterConfigSave();
};

export const filterItemChangeType = (
  groupIndex = -1,
  itemIndex = -1,
  options = {}
) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  if (
    options.name ===
    filterConfigList.value[groupIndex].filters[itemIndex].filterOpts?.name
  ) {
    return;
  }

  filterConfigList.value[groupIndex].filters[itemIndex].filterOpts =
    options || {};
  filterConfigList.value[groupIndex].filters[itemIndex].modelVals = _.cloneDeep(
    options.modelVals || {}
  );

  filterConfigSave();
};

export const applyFilterFunc = (item = {}) => {
  let checkValue = null;

  for (const filterGroup of filterConfigList.value) {
    if (!_.isArray(filterGroup.filters) || filterGroup.filters.length <= 0) {
      continue;
    }

    let groupValue = null;

    for (const filterItem of filterGroup.filters) {
      const itemAction = filterItem.filterOpts?.filterAction;
      const itemOpts = filterItem.filterOpts?.modelOpts || {};
      const itemVals = filterItem.modelVals || {};

      if (!_.isFunction(itemAction)) {
        continue;
      }

      let itemValue = itemAction(item, itemVals, itemOpts);
      const itemOpposite = Boolean(filterItem.oppositeValue);
      const itemOp = filterItem.joinOperator;
      itemValue = itemOpposite ? !itemValue : Boolean(itemValue);
      groupValue = _.isNil(groupValue)
        ? itemValue
        : itemOp === "|"
        ? groupValue || itemValue
        : groupValue && itemValue;
    }

    const groupOpposite = Boolean(filterGroup.oppositeValue);
    const groupOp = filterGroup.joinOperator;
    groupValue = groupOpposite ? !groupValue : Boolean(groupValue);
    checkValue = _.isNil(checkValue)
      ? groupValue
      : groupOp === "|"
      ? checkValue || groupValue
      : checkValue && groupValue;
  }

  return checkValue ?? true;
};

export const applyFilter = (list = []) => _.filter(list, applyFilterFunc);

export const filterConfigSaveDoc = computed({
  get() {
    const saveDocList = [];
    for (const filterGroup of filterConfigList.value) {
      const saveDocFilters = [];

      const filterGroupChildren = filterGroup.filters || [];
      for (const filterItem of filterGroupChildren) {
        const filterName = filterItem.filterOpts?.name;
        if (filterName) {
          saveDocFilters.push({
            ov: Boolean(filterItem.oppositeValue),
            op: filterItem.joinOperator || "&",
            n: filterName,
            v: filterItem.modelVals || {},
          });
        }
      }

      saveDocList.push({
        ov: Boolean(filterGroup.oppositeValue),
        op: filterGroup.joinOperator || "&",
        f: saveDocFilters,
      });
    }

    return saveDocList;
  },
  set(list = []) {
    const restoreDocList = [];
    for (const filterGroup of list) {
      const restoreDocFilters = [];

      const filterGroupChildren = filterGroup.f || [];
      for (const filterItem of filterGroupChildren) {
        const filterName = filterItem.n || "";
        const filterType = filterTypesNameMap[filterName];

        if (filterType) {
          const filterTypeVals = filterType.modelVals || {};
          const filterItemVals = filterItem.v || {};
          const filterCombinedVals = _.defaultsDeep(
            {},
            filterItemVals,
            filterTypeVals
          );

          restoreDocFilters.push({
            oppositeValue: Boolean(filterItem.ov),
            joinOperator: filterItem.op || "&",
            filterOpts: filterType,
            modelVals: filterCombinedVals,
          });
        }
      }

      restoreDocList.push({
        oppositeValue: Boolean(filterGroup.ov),
        joinOperator: filterGroup.op || "&",
        filters: restoreDocFilters,
      });
    }

    filterConfigList.value = restoreDocList;
  },
});

const filterConfigSaveKey = "_yuanshen_dadian_filter";

export const filterConfigSave = () => {
  try {
    localStorage.setItem(
      filterConfigSaveKey,
      JSON.stringify(filterConfigSaveDoc.value)
    );
  } catch (e) { // eslint-disable-line
    // Nothing to do
  }
};

export const filterConfigLoad = (data) => {
  let dataStr = null;
  if (_.isNil(data)) {
    dataStr = localStorage.getItem(filterConfigSaveKey);
  } else {
    dataStr = data;
  }

  try {
    const dataJson = JSON.parse(dataStr);
    if (_.isArray(dataJson) && dataJson.length >= 1) {
      filterConfigSaveDoc.value = dataJson;
    } else {
      filterConfigInit();
    }
  } catch(e) { // eslint-disable-line
    // Nothing to do
  }
};

export const filterConfigShareCode = computed({
  /* eslint-disable no-bitwise */
  get() {
    const buf = new ArrayBuffer(65535);
    const bufView = new Uint8Array(buf);

    let offset = 0;
    for (const filterGroup of filterConfigSaveDoc.value) {
      // 添加过滤组标记位掩码
      const groupMaskOv = filterGroup.ov ? 1 : 0;
      const groupMaskOp = (filterGroup.op === "|" ? 0 : 1) << 1;
      const groupMask = groupMaskOv | groupMaskOp;
      bufView.set([groupMask], offset);
      offset++;

      // 添加过滤组长度
      const groupChildren = filterGroup.f || [];
      const groupChildrenLen = groupChildren.length;
      bufView.set([groupChildrenLen], offset);
      offset++;

      //
      for (const filterItem of groupChildren) {
        // 添加过滤条件ID
        const filterName = filterItem.n || "";
        const filterType = filterTypesNameMap[filterName] || {};
        const filterTypeId = Number(filterType.id) || 0;
        bufView.set([filterTypeId], offset);
        offset++;

        // 添加过滤条件标记位掩码
        const itemMaskOv = filterItem.ov ? 1 : 0;
        const itemMaskOp = (filterItem.op === "|" ? 0 : 1) << 1;
        const itemMask = itemMaskOv | itemMaskOp;
        bufView.set([itemMask], offset);
        offset++;

        // 添加过滤条件数据
        const itemVals = filterItem.v || {};
        const itemValsPacked = JSONPack.pack(itemVals);
        const itemValsBuf = new TextEncoder().encode(itemValsPacked);
        const itemValsBufLen = itemValsBuf.byteLength;
        bufView.set([itemValsBufLen], offset);
        bufView.set(itemValsBuf, offset + 1);
        offset += itemValsBufLen + 1;
      }
    }

    const bufViewTrim = bufView.slice(0, offset);
    const bufViewHash = Base64.fromUint8Array(bufViewTrim, true);
    return bufViewHash;
  },
  set(value = "") {
    if (!value) {
      create_notify("分享码不能为空", "warning");
      return;
    }

    try {
      const docJson = [];
      const docBufView = Base64.toUint8Array(value);
      const docBufLen = docBufView.byteLength;
      let offset = 0;

      while (offset < docBufLen) {
        // 提取过滤组标记位掩码
        const groupMask = docBufView[offset] ?? 2;
        const groupMaskOv = Boolean(groupMask & 1);
        const groupMaskOp = groupMask & (1 << 1) ? "&" : "|";
        offset++;

        // 提取过滤组长度
        const groupChildrenLen = docBufView[offset] || 0;
        offset++;

        const groupChildren = [];
        for (let count = 1; count <= groupChildrenLen; count++) {
          // 提取过滤条件ID
          const itemTypeId = docBufView[offset] || 0;
          const itemType = filterTypesIdMap[itemTypeId] || {};
          const itemTypeName = itemType.name || "";
          offset++;

          // 提取过滤条件标记位掩码
          const itemMask = docBufView[offset] ?? 2;
          const itemMaskOv = Boolean(itemMask & 1);
          const itemMaskOp = itemMask & (1 << 1) ? "&" : "|";
          offset++;

          // 提取过滤条件数据
          const itemValsBufLen = docBufView[offset] || 0;
          const itemValsBuf = docBufView.slice(
            offset + 1,
            offset + itemValsBufLen + 1
          );
          const itemValsPacked = new TextDecoder().decode(itemValsBuf);
          const itemVals = JSONPack.unpack(itemValsPacked);
          offset += itemValsBufLen + 1;

          groupChildren.push({
            n: itemTypeName,
            ov: itemMaskOv,
            op: itemMaskOp,
            v: itemVals,
          });
        }

        docJson.push({
          ov: groupMaskOv,
          op: groupMaskOp,
          f: groupChildren,
        });
      }

      const docStr = JSON.stringify(docJson);

      filterConfigLoad(docStr);
      filterConfigSave();
    } catch(e) { // eslint-disable-line
      create_notify("无效的分享码", "negative");
    }
  },
  /* eslint-enable */
});
