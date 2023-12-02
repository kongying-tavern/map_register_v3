import _ from "lodash";
import { selectorItemId } from "src/components/selector-data";

export default {
  id: 12,
  name: "item-current-count",
  icon: "mdi-counter",
  title: "当前物品计数",
  label: "当前物品计数为",
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
      return `当前物品计数小于等于${maxVal}`;
    }

    if (minVal !== null && maxVal === null) {
      return `当前物品计数大于等于${minVal}`;
    }

    return `当前物品计数为${minVal}~${maxVal}`;
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const { minValue } = values;
    const minVal = _.isNil(minValue) || minValue === "" ? null : minValue;
    const { maxValue } = values;
    const maxVal = _.isNil(maxValue) || maxValue === "" ? null : maxValue;

    const itemList = item.itemList || [];
    const itemCurrent = _.find(
      itemList,
      (v) => v.itemId === selectorItemId.value
    );
    const itemCurrentCount = itemCurrent?.count || 0;
    let minMatch = true;
    let maxMatch = true;

    if (minVal !== null) {
      minMatch = itemCurrentCount >= minVal;
    }

    if (maxVal !== null) {
      maxMatch = itemCurrentCount <= maxVal;
    }

    return minMatch && maxMatch;
  },
};
