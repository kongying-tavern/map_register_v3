import _ from "lodash";

export default {
  id: 11,
  name: "item-count",
  icon: "filter_vintage",
  title: "物品数量",
  label: "物品数量为",
  model: "number-range",
  modelOpts: {},
  modelVals: {
    minValue: null,
    maxValue: null,
  },
  // eslint-disable-next-line no-unused-vars
  modelSemantic(values = {}, options = {}, oppositeValue = false) {
    const { minValue } = values;
    const minVal = _.isNil(minValue) || minValue === "" ? null : minValue;
    const { maxValue } = values;
    const maxVal = _.isNil(maxValue) || maxValue === "" ? null : maxValue;

    if (minVal === null && maxVal === null) {
      return "";
    }

    if (minVal === null && maxVal !== null) {
      return `物品数量小于等于${maxVal}`;
    }

    if (minVal !== null && maxVal === null) {
      return `物品数量大于等于${minVal}`;
    }

    return `物品数量为${minVal}~${maxVal}`;
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const { minValue } = values;
    const minVal = _.isNil(minValue) || minValue === "" ? null : minValue;
    const { maxValue } = values;
    const maxVal = _.isNil(maxValue) || maxValue === "" ? null : maxValue;

    const itemList = item.itemList || [];
    const itemCount = itemList.length || 0;
    let minMatch = true;
    let maxMatch = true;

    if (minVal !== null) {
      minMatch = itemCount >= minVal;
    }

    if (maxVal !== null) {
      maxMatch = itemCount <= maxVal;
    }

    return minMatch && maxMatch;
  },
};
