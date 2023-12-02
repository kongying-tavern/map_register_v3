import _ from "lodash";
import { computed } from "vue";
import { is_neigui } from "src/service/user_info";

export default {
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
      if (is_neigui.value) {
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
};
