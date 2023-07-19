import _ from "lodash";
import { ref, computed } from "vue";
import { create_notify } from "src/api/common";

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
    name: "title-contain",
    icon: "mdi-format-title",
    title: "标题包含",
    label: "标题包含",
    model: "input",
    modelOpts: {
      text: "",
    },
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

export const filterConfigList = ref([_.cloneDeep(filterGroupDefault)]);

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
};

export const filterGroupOpposite = (groupIndex = -1) => {
  if (!filterGroupCheck(groupIndex)) {
    return;
  }

  filterConfigList.value[groupIndex].oppositeValue =
    !filterConfigList.value[groupIndex].oppositeValue;
};

export const filterGroupOpToggle = (groupIndex = -1) => {
  if (!filterGroupCheck(groupIndex)) {
    return;
  }

  const nextOperator =
    filterConfigList.value[groupIndex].joinOperator === "&" ? "|" : "&";
  filterConfigList.value[groupIndex].joinOperator = nextOperator;
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
};

export const filterItemDel = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  filterConfigList.value[groupIndex].filters.splice(itemIndex, 1);
};

export const filterItemOpposite = (groupIndex = -1, itemIndex = -1) => {
  if (!filterItemCheck(groupIndex, itemIndex, true)) {
    return;
  }

  filterConfigList.value[groupIndex].filters[itemIndex].oppositeValue =
    !filterConfigList.value[groupIndex].filters[itemIndex].oppositeValue;
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
};

export const applyFilterFunc = computed(() => (item = {}) => {
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
});

export const applyFilter = (list = []) => _.filter(list, applyFilterFunc.value);
