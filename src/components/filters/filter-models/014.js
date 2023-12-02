import _ from "lodash";
import { computed } from "vue";
import { map_editor_config } from "src/api/config";

export default {
  id: 14,
  name: "refresh-time-special",
  icon: "mdi-clock-time-three-outline",
  title: "特殊刷新时间",
  label: "特殊刷新时间为",
  model: "select",
  modelOpts: {
    multiple: true,
    useChips: true,
    optionValue: "value",
    optionsFunc: computed(
      () => map_editor_config?.value?.refreshTimeSpecial || []
    ),
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

    return `${oppositeValue ? "非" : ""}${selectedNameStr}刷新`;
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const allowedValues = values.value || [];
    if (!_.isArray(allowedValues) || allowedValues.length <= 0) {
      return true;
    }

    const refreshTime = item.refreshTime ?? 0;
    const allowed =
      refreshTime < 0 && allowedValues.indexOf(refreshTime) !== -1;
    return allowed;
  },
};
