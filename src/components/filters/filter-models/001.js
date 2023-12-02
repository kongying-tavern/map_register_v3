import _ from "lodash";
import { h } from "vue";
import { QIcon, QTooltip } from "quasar";

const slotAppend = () =>
  h(
    QIcon,
    { name: "info", size: "sm", class: "cursor-pointer text-grey-7" },
    {
      default: () => [
        h(
          QTooltip,
          {},
          {
            default: () => [
              "可输入多个ID，使用以下符号分隔：",
              h(
                "ol",
                {
                  style: "padding: 0; margin: 0; padding-left: 1.2rem;",
                },
                {
                  default: () => [
                    h("li", {}, { default: () => "半角空格 ( )" }),
                    h("li", {}, { default: () => "半角逗号 (,)" }),
                    h("li", {}, { default: () => "顿号 (、)" }),
                  ],
                }
              ),
            ],
          }
        ),
      ],
    }
  );

export default {
  id: 1,
  name: "id-list",
  icon: "mdi-pound",
  title: "ID范围",
  label: "ID为",
  model: "input",
  modelOpts: {},
  modelVals: {
    text: "",
  },
  // eslint-disable-next-line no-unused-vars
  modelSemantic(values = {}, options = {}, oppositeValue = false) {
    const ids = (values?.text || "")
      .split(/[ ,、]/giu)
      .map((v) => (v || "").trim())
      .filter((v) => v);

    if (ids.length > 1) {
      return `ID${oppositeValue ? "不" : ""}属于列表:${ids.join(",")}`;
    }

    if (ids.length === 1) {
      return `ID${oppositeValue ? "不" : ""}为:${ids[0]}`;
    }
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const inputText = values.text || "";
    if (!inputText) {
      return true;
    }

    const idStr = (item.id || "").toString();
    const allowIdChunks = inputText.split(/[ ,、]/giu);
    const allowIds = _.chain(allowIdChunks)
      .map((v) => (v || "").trim())
      .filter((v) => v)
      .value();
    const check = allowIds.indexOf(idStr) !== -1;
    return check;
  },
  filterSlots: {
    append: slotAppend,
  },
};
