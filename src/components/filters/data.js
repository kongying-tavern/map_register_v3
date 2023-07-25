import _ from "lodash";
import { ref, computed, h } from "vue";
import { encode, decode } from "js-base64";
import JSONPack from "jsonpack";
import { create_notify } from "src/api/common";
import { selectorCollapse } from "src/components/selector-data";
import { QCard, QIcon, QTooltip } from "quasar";

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
};

export const filterTypes = [
  {
    name: "id-list",
    icon: "mdi-pound",
    title: "ID范围",
    label: "ID为",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    modelSemantic(values = {}, oppositeValue = false) {
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
    filterAction(item = {}, values = {}) {
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
    name: "title-contain",
    icon: "mdi-format-title",
    title: "标题包含",
    label: "标题包含",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    modelSemantic: (values = {}, oppositeValue = false) =>
      `标题${oppositeValue ? "不" : ""}包含:${values?.text}`,
    filterAction(item = {}, values = {}) {
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
    name: "content-contain",
    icon: "mdi-note-outline",
    title: "内容包含",
    label: "内容包含",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    modelSemantic: (values = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}包含:${values?.text}`,
    filterAction(item = {}, values = {}) {
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
    name: "content-regex",
    icon: "mdi-regex",
    title: "内容正则匹配",
    label: "内容满足正则",
    model: "input",
    modelOpts: {},
    modelVals: {
      text: "",
    },
    modelSemantic: (values = {}, oppositeValue = false) =>
      `内容${oppositeValue ? "不" : ""}满足正则:${values?.text}`,
    filterAction(item = {}, values = {}) {
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
    modelSemantic: (values = {}, oppositeValue = false) =>
      `点位${oppositeValue ? "不" : ""}属于:${
        values?.value ? values?.textActive || "" : values?.textInactive || ""
      }`,
    filterAction(item = {}, values = {}) {
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
  // {
  //   name: "underground-layer",
  //   icon: "mdi-layers-search-outline",
  //   title: "地下层级",
  //   label: "地下层级位于",
  //   model: "",
  //   modelOpts: {},
  //   modelVals: {},
  //   modelSemantic: (values = {}, oppositeValue = false) => {},
  //   filterAction: (item = {}, values = {}) => {},
  // },
  {
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
    modelSemantic: (values = {}, oppositeValue = false) =>
      `图片${
        (values.value && !oppositeValue) || (!values.value && oppositeValue)
          ? "存在"
          : "不存在"
      }`,
    filterAction(item = {}, values = {}) {
      const switchVal = Boolean(values.value);
      const picture = (item.picture || "").trim();
      const pictureExists = Boolean(picture);
      return switchVal === pictureExists;
    },
  },
  {
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
    modelSemantic: (values = {}, oppositeValue = false) =>
      `视频${
        (values.value && !oppositeValue) || (!values.value && oppositeValue)
          ? "存在"
          : "不存在"
      }`,
    filterAction(item = {}, values = {}) {
      const switchVal = Boolean(values.value);
      const videoPath = (item.videoPath || "").trim();
      const videoPathExists = Boolean(videoPath);
      return switchVal === videoPathExists;
    },
  },
  /**
   * Schema Example:
   * {
   *   name: "",
   *   icon: "",
   *   title: "",
   *   label: "",
   *   model: "",
   *   modelOpts: {},
   *   modelVals: {},
   *   modelSemantic: (values = {}, oppositeValue = false) => {},
   *   filterAction: (item = {}, values = {}) => {},
   * }
   */
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
    filterConfigInit();
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
    filterConfigList.value[groupIndex].filters[itemIndex].filterOpts.name
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
  let checkValue = true;

  for (const filterGroup of filterConfigList.value) {
    if (!_.isArray(filterGroup.filters) || filterGroup.filters.length <= 0) {
      continue;
    }

    let groupValue = true;

    for (const filterItem of filterGroup.filters) {
      const itemAction = filterItem.filterOpts?.filterAction;
      const itemVals = filterItem.modelVals || {};

      if (!_.isFunction(itemAction)) {
        continue;
      }

      let itemValue = itemAction(item, itemVals);
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
        const filterType = filterTypesMap[filterName];

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
  get: () => encode(JSONPack.pack(filterConfigSaveDoc.value), true) || "",
  set(value = "") {
    if (!value) {
      create_notify("分享码不能为空", "warning");
      return;
    }

    try {
      const dataObj = JSONPack.unpack(decode(value));
      const dataStr = JSON.stringify(dataObj);
      filterConfigLoad(dataStr);
    } catch(e) { // eslint-disable-line
      create_notify("无效的分享码", "negative");
    }
  },
});
