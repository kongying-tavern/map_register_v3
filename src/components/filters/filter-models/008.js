export default {
  id: 8,
  name: "video",
  icon: "mdi-play-box-multiple-outline",
  title: "视频地址",
  label: "视频地址",
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
    `视频${
      (values.value && !oppositeValue) || (!values.value && oppositeValue)
        ? "存在"
        : "不存在"
    }`,
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const switchVal = Boolean(values.value);
    const videoPath = (item.videoPath || "").trim();
    const videoPathExists = Boolean(videoPath);
    return switchVal === videoPathExists;
  },
};
