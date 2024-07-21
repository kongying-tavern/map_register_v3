import _ from "lodash";
import { computed, h } from "vue";
import { QCard } from "quasar";
import { map_plugin_config } from "src/api/config";
import { selectorArea } from "src/components/selector-data";

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
      default: () =>
        h(
          "div",
          { class: "text-grey-9" },
          {
            default: () => [
              h(
                "ol",
                { style: "padding: 0; margin: 0; margin-left: 1.4rem;" },
                {
                  default: () => [
                    h(
                      "li",
                      {},
                      {
                        default: () => [
                          "无选中等价于",
                          h("b", {}, "全选所有可选层级"),
                          "，当前区域无分层层级则此条件默认为真",
                        ],
                      }
                    ),
                    h("li", {}, "选项仅包含当前区域的分层层级"),
                    h(
                      "li",
                      {},
                      "若区域和已选分层层级无法匹配，选项可能出现层级标识，不影响具体筛选功能"
                    ),
                  ],
                }
              ),
            ],
          }
        ),
    }
  );

export default {
  id: 6,
  name: "underground-layer",
  icon: "mdi-layers-search-outline",
  title: "分层层级",
  label: "分层层级位于",
  model: "select",
  modelOpts: {
    multiple: true,
    behavior: "dialog",
    useChips: true,
    optionValue: "value",
    noOptionText: "无可选分层层级，请切换至有分层层级的地区",
    optionsFunc: computed(() => {
      const pluginConfigMap = map_plugin_config.value || {};
      const options = [];
      const selectedAreaCode = selectorArea.value?.code || "";

      if (!selectedAreaCode) {
        return options;
      }

      const pluginConfig = pluginConfigMap[selectedAreaCode] || {};
      const undergroundLevels =
        pluginConfig.extraConfig?.underground?.levels || [];

      for (const group of undergroundLevels) {
        const regionName = group.label || "";
        const children = group.children || [];

        for (const item of children) {
          const levelName = item.label || "";
          const levelCode = item.value || "";

          options.push({
            areaCode: selectedAreaCode,
            regionName,
            levelName,
            label: levelName,
            value: levelCode,
          });
        }
      }

      return options;
    }),
  },
  modelVals: {
    value: [],
  },
  modelSemantic(values = {}, options = {}, oppositeValue = false) {
    const selectedValue = values.value || [];
    const optionsFull = options.optionsFunc || [];
    const optionsMap = _.keyBy(optionsFull, "value");

    let selectedAll = false;
    if (!_.isArray(selectedValue)) {
      selectedAll = true;
    } else if (selectedValue.length <= 0) {
      selectedAll = true;
    }

    if (selectedAll) {
      return oppositeValue
        ? "点位不属于当前区域任何分层层级"
        : "点位属于当前区域所有分层层级";
    }

    const levelNameExists = [];
    let levelNameMissing = 0;
    for (const selectedVal of selectedValue) {
      const optionObj = optionsMap[selectedVal] || {};
      const optionLabel = optionObj.label || "";
      if (optionLabel) {
        levelNameExists.push(optionLabel);
      } else {
        levelNameMissing++;
      }
    }

    let levelNameExistsText = "";
    let levelNameMissingText = "";
    if (oppositeValue) {
      levelNameExistsText = `点位不属于${levelNameExists.join(",")}`;
      levelNameMissingText =
        levelNameMissing > 0 ? `及其他地区的${levelNameMissing}个分层层级` : "";
    } else {
      levelNameExistsText = `点位属于${levelNameExists.join(",")}`;
      levelNameMissingText =
        levelNameMissing > 0 ? `或其他地区的${levelNameMissing}个分层层级` : "";
    }

    return `${levelNameExistsText}${levelNameMissingText}`;
  },
  filterAction(item = {}, values = {}, options = {}) {
    const selectedValue = values.value || [];
    let selectedVals = [];

    // 获取已经选择的值
    if (!_.isArray(selectedValue)) {
      selectedVals = null;
    } else if (selectedValue.length <= 0) {
      selectedVals = null;
    } else {
      selectedVals = selectedValue;
    }

    const optionsFull = options.optionsFunc || [];
    if (_.isNil(selectedVals)) {
      if (!_.isArray(optionsFull) || optionsFull.length <= 0) {
        return true;
      }

      selectedVals = _.map(optionsFull, "value");
    }

    // 获取额外字段
    const extraJson = item.extra || {};
    const undergroundLevels = extraJson.underground?.region_levels || [];
    const undergroundLevelsMatchList = _.intersection(
      undergroundLevels,
      selectedVals
    );
    const undergroundLevelsMatch = undergroundLevelsMatchList.length > 0;

    return undergroundLevelsMatch;
  },
  filterSlots: {
    after: slotAfter,
  },
};
