export default {
  id: 3,
  name: "content-contain",
  icon: "mdi-note-outline",
  title: "内容包含",
  label: "内容包含",
  model: "input",
  modelOpts: {},
  modelVals: {
    text: "",
  },
  // eslint-disable-next-line no-unused-vars
  modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
    `内容${oppositeValue ? "不" : ""}包含:${values?.text}`,
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const inputText = values.text || "";
    if (!inputText) {
      return true;
    }

    const content = item.content || "";
    const check = content.indexOf(inputText) !== -1;
    return check;
  },
};
