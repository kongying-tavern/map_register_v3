export default {
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
};
