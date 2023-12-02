import { h } from "vue";
import { QCard } from "quasar";

const slotAfter = () =>
  h(
    QCard,
    {
      flat: true,
      bordered: true,
      style: "margin-top: .4rem; margin-bottom: .2rem; padding: .3rem;",
      class: "bg-blue-grey-1",
    },
    {
      default: () => [
        "推荐链接：",
        h(
          "ol",
          { style: "padding: 0; margin: 0; padding-left: 1.2rem;" },
          {
            default: () => [
              h(
                "li",
                {},
                {
                  default: () => [
                    h(
                      "a",
                      {
                        href: "https://regexlearn.com/zh-cn",
                        target: "_blank",
                      },
                      {
                        default: () =>
                          "RegExp Learn - 逐步学习正则表达式，从零基础到高阶",
                      }
                    ),
                  ],
                }
              ),
              h(
                "li",
                {},
                {
                  default: () => [
                    h(
                      "a",
                      {
                        href: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions",
                        target: "_blank",
                      },
                      {
                        default: () => "正则表达式 - MDN (Javascript)",
                      }
                    ),
                  ],
                }
              ),
              h(
                "li",
                {},
                {
                  default: () => [
                    h(
                      "a",
                      {
                        href: "https://learn.microsoft.com/zh-cn/dotnet/standard/base-types/regular-expression-language-quick-reference",
                        target: "_blank",
                      },
                      {
                        default: () =>
                          "正则表达式 - 快速参考 - Microsoft Learn",
                      }
                    ),
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
  id: 4,
  name: "content-regex",
  icon: "mdi-regex",
  title: "内容正则匹配",
  label: "内容满足正则",
  model: "input",
  modelOpts: {},
  modelVals: {
    text: "",
  },
  // eslint-disable-next-line no-unused-vars
  modelSemantic: (values = {}, options = {}, oppositeValue = false) =>
    `内容${oppositeValue ? "不" : ""}满足正则:${values?.text}`,
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const inputText = values.text || "";
    if (!inputText) {
      return true;
    }

    const content = item.content || "";
    let check = false;

    try {
      const re = new RegExp(inputText, "gui");
      check = re.test(content);
    } catch (e) { // eslint-disable-line
      // Nothing to do
    }

    return check;
  },
  filterSlots: {
    after: slotAfter,
  },
};
