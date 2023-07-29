import _ from "lodash";
import { ref, computed, h } from "vue";
import { QCard, QIcon, QTooltip } from "quasar";
import { Base64 } from "js-base64";
import JSONPack from "jsonpack";
import { create_notify } from "src/api/common";
import {
  selectorArea,
  selectorAreaId,
  selectorTypeId,
  selectorItemMap,
  selectorCollapse,
} from "src/components/selector-data";
import { map_plugin_config } from "src/api/config";
import { is_neigui } from "src/service/user_info";

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

export const filterTypeSlots = {
  idListAppend: () =>
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
  contentRegexAfter() {
    return h(
      QCard,
      {
        flat: true,
        bordered: true,
        style: "margin-top: .4rem; margin-bottom: .2rem; padding: .3rem;",
        class: "bg-blue-grey-1",
      },
      {
        default: () => [
          "推荐链接：",
          h(
            "ol",
            { style: "padding: 0; margin: 0; padding-left: 1.2rem;" },
            {
              default: () => [
                h(
                  "li",
                  {},
                  {
                    default: () => [
                      h(
                        "a",
                        {
                          href: "https://regexlearn.com/zh-cn",
                          target: "_blank",
                        },
                        {
                          default: () =>
                            "RegExp Learn - 逐步学习正则表达式，从零基础到高阶",
                        }
                      ),
                    ],
                  }
                ),
                h(
                  "li",
                  {},
                  {
                    default: () => [
                      h(
                        "a",
                        {
                          href: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions",
                          target: "_blank",
                        },
                        {
                          default: () => "正则表达式 - MDN (Javascript)",
                        }
                      ),
                    ],
                  }
                ),
                h(
                  "li",
                  {},
                  {
                    default: () => [
                      h(
                        "a",
                        {
                          href: "https://learn.microsoft.com/zh-cn/dotnet/standard/base-types/regular-expression-language-quick-reference",
                          target: "_blank",
                        },
                        {
                          default: () =>
                            "正则表达式 - 快速参考 - Microsoft Learn",
                        }
                      ),
                    ],
                  }
                ),
              ],
            }
          ),
        ],
      }
    );
  },
  undergroundLayerAfter: () =>
    h(
      QCard,
      {
        flat: true,
        bordered: true,
        style: "margin-top: .4rem; margin-bottom: .2rem; padding: .3rem;",
        class: "bg-blue-grey-1",
      },
      {
        default: () =>
          h(
            "div",
            { class: "text-grey-9" },
            {
              default: () => [
                h(
                  "ol",
                  { style: "padding: 0; margin: 0; margin-left: 1.4rem;" },
                  {
                    default: () => [
                      h(
                        "li",
                        {},
                        {
                          default: () => [
                            "无选中等价于",
                            h("b", {}, "全选所有可选层级"),
                            "，当前区域无地下层级则此条件默认为真",
                          ],
                        }
                      ),
                      h("li", {}, "选项仅包含当前区域的地下层级"),
                      h(
                        "li",
                        {},
                        "若区域和已选地下层级无法匹配，选项可能出现层级标识，不影响具体筛选功能"
                      ),
                    ],
                  }
                ),
              ],
            }
          ),
      }
    ),
};

export const filterTypes = [
  {
    id: 1,
    name: "id-list",
    icon: "mdi-pound",
    title: "ID范围",
    label: "ID为",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic(values = {}, options = {}, oppositeValue = false) {
      const ids = (values?.text || "")
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
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const inputText = values.text || "";
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
      append: filterTypeSlots.idListAppend,
    },
  },
  {
    id: 2,
    name: "title-contain",
    icon: "mdi-format-title",
    title: "标题包含",
    label: "标题包含",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `标题${oppositeValue ? "不" : ""}包含:${values?.text}`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const inputText = values.text || "";
      if (!inputText) {
        return true;
      }

      const title = item.markerTitle || "";
      const check = title.indexOf(inputText) !== -1;
      return check;
    },
  },
  {
    id: 3,
    name: "content-contain",
    icon: "mdi-note-outline",
    title: "内容包含",
    label: "内容包含",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}包含:${values?.text}`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const inputText = values.text || "";
      if (!inputText) {
        return true;
      }

      const content = item.content || "";
      const check = content.indexOf(inputText) !== -1;
      return check;
    },
  },
  {
    id: 4,
    name: "content-regex",
    icon: "mdi-regex",
    title: "内容正则匹配",
    label: "内容满足正则",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}满足正则:${values?.text}`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const inputText = values.text || "";
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
    filterSlots: {
      after: filterTypeSlots.contentRegexAfter,
    },
  },
  {
    id: 5,
    name: "underground",
    icon: "mdi-layers-outline",
    title: "地下匹配",
    label: "点位属于",
    model: "toggle",
    modelOpts: {
      textInactive: "地上",
      textActive: "地下",
    },
    modelVals: {
      value: true,
    },

    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `点位${oppositeValue ? "不" : ""}属于:${
        values?.value ? options.textActive || "" : options.textInactive || ""
      }`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const switchVal = Boolean(values.value);
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
  {
    id: 6,
    name: "underground-layer",
    icon: "mdi-layers-search-outline",
    title: "地下层级",
    label: "地下层级位于",
    model: "select",
    modelOpts: {
      multiple: true,
      behavior: "dialog",
      useChips: true,
      optionValue: "value",
      noOptionText: "无可选地下层级，请切换至有地下层级的地区",
      optionsFunc: computed(() => {
        const pluginConfigMap = map_plugin_config.value || {};
        const options = [];
        const selectedAreaCode = selectorArea.value?.code || "";

        if (!selectedAreaCode) {
          return options;
        }

        const pluginConfig = pluginConfigMap[selectedAreaCode] || {};
        const undergroundLevels =
          pluginConfig.extraConfig?.underground?.levels || [];

        for (const group of undergroundLevels) {
          const regionName = group.label || "";
          const children = group.children || [];

          for (const item of children) {
            const levelName = item.label || "";
            const levelCode = item.value || "";

            options.push({
              areaCode: selectedAreaCode,
              regionName,
              levelName,
              label: levelName,
              value: levelCode,
            });
          }
        }

        return options;
      }),
    },
    modelVals: {
      value: [],
    },
    modelSemantic(values = {}, options = {}, oppositeValue = false) {
      const selectedValue = values.value || [];
      const optionsFull = options.optionsFunc || [];
      const optionsMap = _.keyBy(optionsFull, "value");

      let selectedAll = false;
      if (!_.isArray(selectedValue)) {
        selectedAll = true;
      } else if (selectedValue.length <= 0) {
        selectedAll = true;
      }

      if (selectedAll) {
        return oppositeValue
          ? "点位不属于当前区域任何地下层级"
          : "点位属于当前区域所有地下层级";
      }

      const levelNameExists = [];
      let levelNameMissing = 0;
      for (const selectedVal of selectedValue) {
        const optionObj = optionsMap[selectedVal] || {};
        const optionLabel = optionObj.label || "";
        if (optionLabel) {
          levelNameExists.push(optionLabel);
        } else {
          levelNameMissing++;
        }
      }

      let levelNameExistsText = "";
      let levelNameMissingText = "";
      if (oppositeValue) {
        levelNameExistsText = `点位不属于${levelNameExists.join(",")}`;
        levelNameMissingText =
          levelNameMissing > 0
            ? `及其他地区的${levelNameMissing}个地下层级`
            : "";
      } else {
        levelNameExistsText = `点位属于${levelNameExists.join(",")}`;
        levelNameMissingText =
          levelNameMissing > 0
            ? `或其他地区的${levelNameMissing}个地下层级`
            : "";
      }

      return `${levelNameExistsText}${levelNameMissingText}`;
    },
    filterAction(item = {}, values = {}, options = {}) {
      const selectedValue = values.value || [];
      let selectedVals = [];

      // 获取已经选择的值
      if (!_.isArray(selectedValue)) {
        selectedVals = null;
      } else if (selectedValue.length <= 0) {
        selectedVals = null;
      } else {
        selectedVals = selectedValue;
      }

      const optionsFull = options.optionsFunc.value || [];
      if (_.isNil(selectedVals)) {
        if (!_.isArray(optionsFull) || optionsFull.length <= 0) {
          return true;
        }

        selectedVals = _.map(optionsFull, "value");
      }

      // 获取额外字段
      const extraText = item.markerExtraContent || "{}";
      let extraJson = {};
      try {
        extraJson = JSON.parse(extraText);
        extraJson = _.isPlainObject(extraJson) ? extraJson : {};
      } catch(e) { // eslint-disable-line
        // nothing to do
      }

      const undergroundLevels = extraJson.underground?.region_levels || [];
      const undergroundLevelsMatchList = _.intersection(
        undergroundLevels,
        selectedVals
      );
      const undergroundLevelsMatch = undergroundLevelsMatchList.length > 0;

      return undergroundLevelsMatch;
    },
    filterSlots: {
      after: filterTypeSlots.undergroundLayerAfter,
    },
  },
  {
    id: 7,
    name: "image",
    icon: "mdi-image-multiple-outline",
    title: "点位图片",
    label: "点位图片",
    model: "toggle",
    modelOpts: {
      textInactive: "不存在",
      textActive: "存在",
    },
    modelVals: {
      value: true,
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `图片${
        (values.value && !oppositeValue) || (!values.value && oppositeValue)
          ? "存在"
          : "不存在"
      }`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const switchVal = Boolean(values.value);
      const picture = (item.picture || "").trim();
      const pictureExists = Boolean(picture);
      return switchVal === pictureExists;
    },
  },
  {
    id: 8,
    name: "video",
    icon: "mdi-play-box-multiple-outline",
    title: "视频地址",
    label: "视频地址",
    model: "toggle",
    modelOpts: {
      textInactive: "不存在",
      textActive: "存在",
    },
    modelVals: {
      value: true,
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
      `视频${
        (values.value && !oppositeValue) || (!values.value && oppositeValue)
          ? "存在"
          : "不存在"
      }`,
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const switchVal = Boolean(values.value);
      const videoPath = (item.videoPath || "").trim();
      const videoPathExists = Boolean(videoPath);
      return switchVal === videoPathExists;
    },
  },
  {
    id: 9,
    name: "visibility",
    icon: "mdi-eye",
    title: "可见范围",
    label: "可见范围为",
    model: "select",
    modelOpts: {
      multiple: true,
      useChips: true,
      optionValue: "value",
      optionsFunc: computed(() => {
        const options = [
          { label: "显示", value: 0 },
          { label: "隐藏", value: 1 },
        ];
        if (is_neigui()) {
          options.push({ label: "内鬼", value: 2 });
        }

        return options;
      }),
    },
    modelVals: {
      value: [],
    },

    modelSemantic(values = {}, options = {}, oppositeValue = false) {
      const selectedValue = values.value || [];
      if (!_.isArray(selectedValue) || selectedValue.length <= 0) {
        return "";
      }

      const optionsFull = options.optionsFunc || [];
      const optionsMap = _.chain(optionsFull)
        .keyBy("value")
        .mapValues((v) => v.label)
        .value();
      const selectedNames = _.chain(selectedValue)
        .map((v) => optionsMap[v])
        .filter((v) => v)
        .uniq()
        .value();
      const selectedNameStr = selectedNames.join(",");

      if (!selectedNameStr) {
        return "";
      }

      return selectedNames.length > 1
        ? `${oppositeValue ? "不" : ""}属于${selectedNameStr}点位`
        : `${oppositeValue ? "不" : ""}为${selectedNameStr}点位`;
    },
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const allowedValues = values.value || [];
      if (!_.isArray(allowedValues) || allowedValues.length <= 0) {
        return true;
      }

      const hiddenFlag = item.hiddenFlag ?? -1;
      const allowed = allowedValues.indexOf(hiddenFlag) !== -1;
      return allowed;
    },
  },
  {
    id: 10,
    name: "item-contain",
    icon: "pets",
    title: "物品名称",
    label: "物品名包含",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    // eslint-disable-next-line no-unused-vars
    modelSemantic(values = {}, options = {}, oppositeValue = false) {
      const inputVal = values.text || "";
      if (!inputVal) {
        return "";
      }

      return `物品名${oppositeValue ? "不" : ""}包含:${inputVal}`;
    },
    // eslint-disable-next-line no-unused-vars
    filterAction(item = {}, values = {}, options = {}) {
      const inputVal = values.text || "";
      if (!inputVal) {
        return true;
      }

      const areaId = Number(selectorAreaId.value) || 0;
      const typeId = Number(selectorTypeId.value) || 0;
      const itemList = item.itemList || [];
      const itemFiltered = _.filter(itemList, (v) => {
        const itemId = Number(v.itemId) || 0;
        const itemMapId = `${areaId}-${typeId}`;
        const itemMatch = _.chain(selectorItemMap.value[itemMapId])
          .filter((v) => v.itemId.toString() === itemId.toString())
          .first()
          .value();
        const itemName = itemMatch?.name || "";
        return itemName.indexOf(inputVal) !== -1;
      });
      const itemNameMatch = itemFiltered.length > 0;
      return itemNameMatch;
    },
  },
  /**
   * Schema Example:
   * {
   *   id: 0,
   *   name: "",
   *   icon: "",
   *   title: "",
   *   label: "",
   *   model: "",
   *   modelOpts: {},
   *   modelVals: {},
   *   // eslint-disable-next-line no-unused-vars
   *   modelSemantic: (values = {}, options = {}, oppositeValue = false) => {},
   *   // eslint-disable-next-line no-unused-vars
   *   filterAction: (item = {}, values = {}, options = {}) => {},
   * }
   */
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
