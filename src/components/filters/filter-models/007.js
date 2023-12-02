export default {
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
};
