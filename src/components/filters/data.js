import _ from "lodash";
import { ref, computed, h } from "vue";
import { create_notify } from "src/api/common";
import { selectorCollapse } from "src/components/selector-data";
import { QIcon, QTooltip } from "quasar";

export const filterCardVisible = ref(false);

export const filterCacheSelectorCollapse = ref(false);

export const filterMuteTooltip = ref(false);

export const filterCardToggle = () => {
  filterCardVisible.value = !filterCardVisible.value;

  if (filterCardVisible.value && !selectorCollapse.value) {
    filterCacheSelectorCollapse.value = selectorCollapse.value;
    selectorCollapse.value = true;
  } else if (!filterCardVisible.value) {
    selectorCollapse.value = filterCardVisible.value;
  }
};

export const groupJoinOperatorOptions = [{ value: "" }, { value: "" }];

export const filterGroupDefault = {
  joinOperator: "&",
  oppositeValue: false,
  filters: [],
};

export const filterItemDefault = {
  joinOperator: "&",
  oppositeValue: false,
  model: "",
  modelOpts: {},
  filterOpts: {},
};

export const filterTypes = [
  {
    name: "id-list",
    icon: "mdi-pound",
    title: "ID范围",
    label: "ID为",
    model: "input",
    modelOpts: {
      text: "",
    },
    modelSemantic(options = {}, oppositeValue = false) {
      const ids = (options?.text || "")
        .split(/[ ,、]/giu)
        .map((v) => (v || "").trim())
        .filter((v) => v);

      if (ids.length > 1) {
        return `ID${oppositeValue ? "不" : ""}属于列表:${ids.join(",")}`;
      }

      if (ids.length === 1) {
        return `ID${oppositeValue ? "不" : ""}为:${ids[0]}`;
      }
    },
    filterAction(item = {}, options = {}) {
      const inputText = options.text || "";
      if (!inputText) {
        return true;
      }

      const idStr = (item.id || "").toString();
      const allowIdChunks = inputText.split(/[ ,、]/giu);
      const allowIds = _.chain(allowIdChunks)
        .map((v) => (v || "").trim())
        .filter((v) => v)
        .value();
      const check = allowIds.indexOf(idStr) !== -1;
      return check;
    },
    filterSlots: {
      append: () =>
        h(
          QIcon,
          { name: "info", size: "sm", class: "cursor-pointer text-grey-7" },
          {
            default: () => [
              h(
                QTooltip,
                {},
                {
                  default: () => [
                    "可输入多个ID，使用以下符号分隔：",
                    h(
                      "ol",
                      {
                        style: "padding: 0; margin: 0; padding-left: 1.2rem;",
                      },
                      {
                        default: () => [
                          h("li", {}, { default: () => "半角空格 ( )" }),
                          h("li", {}, { default: () => "半角逗号 (,)" }),
                          h("li", {}, { default: () => "顿号 (、)" }),
                        ],
                      }
                    ),
                  ],
                }
              ),
            ],
          }
        ),
    },
  },
  {
    name: "title-contain",
    icon: "mdi-format-title",
    title: "标题包含",
    label: "标题包含",
    model: "input",

    modelOpts: {
      text: "",
    },
    modelSemantic: (options = {}, oppositeValue = false) =>
      `标题${oppositeValue ? "不" : ""}包含:${options?.text}`,
    filterAction(item = {}, options = {}) {
      const inputText = options.text || "";
      if (!inputText) {
        return true;
      }

      const title = item.markerTitle || "";
      const check = title.indexOf(inputText) !== -1;
      return check;
    },
  },
  {
    name: "content-contain",
    icon: "mdi-note-outline",
    title: "内容包含",
    label: "内容包含",
    model: "input",
    modelOpts: {
      text: "",
    },
    modelSemantic: (options = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}包含:${options?.text}`,
    filterAction(item = {}, options = {}) {
      const inputText = options.text || "";
      if (!inputText) {
        return true;
      }

      const content = item.content || "";
      const check = content.indexOf(inputText) !== -1;
      return check;
    },
  },
  {
    name: "content-regex",
    icon: "mdi-regex",
    title: "内容正则匹配",
    label: "内容满足正则",
    model: "input",
    modelOpts: {
      text: "",
    },
    modelSemantic: (options = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}满足正则:${options?.text}`,
    filterAction(item = {}, options = {}) {
      const inputText = options.text || "";
      if (!inputText) {
        return true;
      }

      const content = item.content || "";
      let check = false;

      try {
        const re = new RegExp(inputText, "gui");
        check = re.test(content);
      } catch (e) { // eslint-disable-line
        // Nothing to do
      }

      return check;
    },
  },
  {
    name: "underground",
    icon: "mdi-layers-outline",
    title: "地下匹配",
    label: "点位属于",
    model: "toggle",
    modelOpts: {
      value: true,
      textInactive: "地上",
      textActive: "地下",
    },
    modelSemantic: (options = {}, oppositeValue = false) =>
      `点位${oppositeValue ? "不" : ""}属于:${
        options?.value ? options?.textActive || "" : options?.textInactive || ""
      }`,
    filterAction(item = {}, options = {}) {
      const switchVal = Boolean(options.value);
      const extraText = item.markerExtraContent || "{}";
      let extraJson = {};
      try {
        extraJson = JSON.parse(extraText);
        extraJson = _.isPlainObject(extraJson) ? extraJson : {};
      } catch(e) { // eslint-disable-line
        // nothing to do
      }

      const isUnderground = Boolean(extraJson.underground?.is_underground);
      return switchVal === isUnderground;
    },
  },
  // {
  //   name: "underground-layer",
  //   icon: "mdi-layers-search-outline",
  //   title: "地下层级",
  //   label: "地下层级位于",
  // },
];

export const filterTypesMap = _.keyBy(filterTypes, "name");

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
    create_notify("无法删除最后一个条件组", "warning");
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
    filterConfigList.value[groupIndex].filters[itemIndex].filterOpts.name
  ) {
    return;
  }

  filterConfigList.value[groupIndex].filters[itemIndex].filterOpts =
    options || {};
  filterConfigList.value[groupIndex].filters[itemIndex].model =
    options.model || "";
  filterConfigList.value[groupIndex].filters[itemIndex].modelOpts = _.cloneDeep(
    options.modelOpts || {}
  );

  filterConfigSave();
};

export const applyFilterFunc = (item = {}) => {
  let checkValue = true;

  for (const filterGroup of filterConfigList.value) {
    if (!_.isArray(filterGroup.filters) || filterGroup.filters.length <= 0) {
      continue;
    }

    let groupValue = true;

    for (const filterItem of filterGroup.filters) {
      const itemAction = filterItem.filterOpts?.filterAction;
      const itemOpts = filterItem.modelOpts || {};

      if (!_.isFunction(itemAction)) {
        continue;
      }

      let itemValue = itemAction(item, itemOpts);
      const itemOpposite = Boolean(filterItem.oppositeValue);
      const itemOp = filterItem.joinOperator;
      itemValue = itemOpposite ? !itemValue : Boolean(itemValue);
      groupValue =
        itemOp === "|" ? groupValue || itemValue : groupValue && itemValue;
    }

    const groupOpposite = Boolean(filterGroup.oppositeValue);
    const groupOp = filterGroup.joinOperator;
    groupValue = groupOpposite ? !groupValue : Boolean(groupValue);
    checkValue =
      groupOp === "|" ? checkValue || groupValue : checkValue && groupValue;
  }

  return checkValue;
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
            c: filterItem.modelOpts || {},
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
        const filterType = filterTypesMap[filterName];

        if (filterType) {
          const filterTypeOpts = filterType.modelOpts || {};
          const filterItemOpts = filterItem.c || {};
          const filterCombinedOpts = _.defaultsDeep(
            {},
            filterItemOpts,
            filterTypeOpts
          );

          restoreDocFilters.push({
            oppositeValue: Boolean(filterItem.ov),
            joinOperator: filterItem.op || "&",
            filterOpts: filterType,
            model: filterType.model || "",
            modelOpts: filterCombinedOpts,
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

export const filterConfigLoad = () => {
  try {
    const dataStr = localStorage.getItem(filterConfigSaveKey);
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
