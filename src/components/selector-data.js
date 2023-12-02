import _ from "lodash";
import { ref, computed } from "vue";
import { filterCardVisible } from "./filters/filter-data";

export const selectorCollapse = ref(false);

export const selectorStepperCollapseIcon = computed(() =>
  selectorCollapse.value
    ? "keyboard_double_arrow_down"
    : "keyboard_double_arrow_up"
);
export const selectorStepperCollapseText = computed(() =>
  selectorCollapse.value ? "展开" : "收起"
);

export const selectorCacheFilterVisible = ref(false);

export const selectorStep = ref(1);

export const selectorToggle = (state) => {
  selectorCollapse.value = _.isNil(state)
    ? !selectorCollapse.value
    : Boolean(state);

  if (!selectorCollapse.value && filterCardVisible.value) {
    selectorCacheFilterVisible.value = filterCardVisible.value;
    filterCardVisible.value = false;
  } else if (selectorCollapse.value) {
    filterCardVisible.value = selectorCacheFilterVisible.value;
  }
};

export const selectorJumpPrev = () => {
  selectorStep.value -= 1;
};

export const selectorJumpNext = () => {
  selectorStep.value += 1;
};

export const selectorJumpTo = (step = 1) => {
  selectorStep.value = step;
};

export const selectorIconMap = ref({});

export const selectorAreaTopId = ref(null);
export const selectorArea = ref(null);
export const selectorAreaList = ref([]);

export const selectorAreaId = computed(
  () => (selectorArea.value || {}).id || 0
);
export const selectorAreaName = computed(
  () => (selectorArea.value || {}).name || ""
);
export const selectorAreaMap = computed(() =>
  _.groupBy(selectorAreaList.value, "parentId")
);
export const selectorAreaCodeMap = computed(() =>
  _.keyBy(selectorAreaList.value, "code")
);
export const selectorAreaListTop = computed(
  () => selectorAreaMap.value[-1] || []
);
export const selectorAreaListChild = computed(
  () => selectorAreaMap.value[selectorAreaTopId.value || 0] || []
);

export const selectorAreaTestSelect = (area) => {
  if (area.isFinal) {
    return area.id === selectorAreaId.value;
  }

  return area.id === selectorAreaTopId.value;
};

export const selectorType = ref(null);
export const selectorTypeList = ref([]);
export const selectorTypeChildList = ref([]);

export const selectorTypeId = computed(
  () => (selectorType.value || {}).id || 0
);
export const selectorTypeName = computed(
  () => (selectorType.value || {}).name || ""
);
export const selectorTypeChildIds = computed(() =>
  _.map(selectorTypeChildList.value || [], (v) => v.id)
);
export const selectorTypeMap = computed(() =>
  _.keyBy([...selectorTypeList.value, ...selectorTypeChildList.value], "id")
);

export const selectorItem = ref(null);
export const selectorItemFullList = ref([]);

export const selectorItemId = computed(
  () => (selectorItem.value || {}).id || 0
);
export const selectorItemName = computed(() => {
  if (selectorItemAllAllowable.value && _.isNil(selectorItem.value)) {
    return "全部";
  }

  return (selectorItem.value || {}).name || "";
});
export const selectorItemIcontag = computed(
  () => (selectorItem.value || {}).iconTag || ""
);
export const selectorItemPatchedList = computed(() => {
  const item_list = _.flatMap(selectorItemFullList.value, (item) => {
    const area_id = _.toNumber(item.areaId) || 0;
    const type_id_list = item.typeIdList || [];

    return _.map(type_id_list, (type_id) => {
      const item_key = `${area_id}-${type_id}`;
      const row = _.cloneDeep(item);

      row.itemKey = item_key;
      row.typeId = type_id;
      return row;
    });
  });
  return item_list;
});
export const selectorItemMap = computed(() =>
  _.groupBy(selectorItemPatchedList.value, "itemKey")
);
export const selectorItemList = computed(() => {
  const item_key = `${selectorAreaId.value}-${selectorTypeId.value}`;
  const item_list = _.get(selectorItemMap.value, item_key, []);
  return item_list;
});
export const selectorItemIds = computed(() =>
  _.map(selectorItemList.value || [], (v) => v.id)
);
export const selectorItemAllAllowable = computed(() => {
  const pid = (selectorType.value || {}).parentId;
  return pid && pid !== -1;
});
export const selectorItemIcontags = computed(() =>
  _.chain(selectorItemList.value || [])
    .map((v) => v.iconTag)
    .filter((v) => v)
    .value()
);
