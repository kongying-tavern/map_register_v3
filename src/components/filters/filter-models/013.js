import _ from "lodash";
import { h } from "vue";

const slotAppend = () => h("span", {}, "小时");

export default {
  id: 13,
  name: "refresh-time",
  icon: "mdi-timer-sand",
  title: "刷新时间",
  label: "刷新时间为",
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
      return `点位刷新时间小于等于${maxVal}小时`;
    }

    if (minVal !== null && maxVal === null) {
      return `点位刷新时间大于等于${minVal}小时`;
    }

    return `点位刷新时间为${minVal}~${maxVal}小时`;
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const { minValue } = values;
    const minVal = _.isNil(minValue) || minValue === "" ? null : minValue;
    const { maxValue } = values;
    const maxVal = _.isNil(maxValue) || maxValue === "" ? null : maxValue;

    const refreshTime = item?.refreshTime || 0;
    let minMatch = true;
    let maxMatch = true;
    const hourRatio = 3600e3;

    if (minVal !== null) {
      minMatch = refreshTime * hourRatio >= minVal;
    }

    if (maxVal !== null) {
      maxMatch = refreshTime * hourRatio <= maxVal;
    }

    return minMatch && maxMatch;
  },
  filterSlots: {
    append: slotAppend,
  },
};
