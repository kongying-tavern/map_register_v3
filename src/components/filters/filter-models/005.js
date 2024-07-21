export default {
  id: 5,
  name: "underground",
  icon: "mdi-layers-outline",
  title: "地面层级",
  label: "点位属于",
  model: "toggle",
  modelOpts: {
    textInactive: "地面",
    textActive: "非地面",
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
    const extraJson = item.extra || {};
    const isUnderground = Boolean(extraJson.underground?.is_underground);
    return switchVal === isUnderground;
  },
};
