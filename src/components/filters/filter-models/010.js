import _ from "lodash";
import {
  selectorAreaId,
  selectorTypeId,
  selectorItemMap,
} from "src/components/selector-data";

export default {
  id: 10,
  name: "item-contain",
  icon: "pets",
  title: "物品名称",
  label: "物品名包含",
  model: "input",
  modelOpts: {},
  modelVals: {
    text: "",
  },
  // eslint-disable-next-line no-unused-vars
  modelSemantic(values = {}, options = {}, oppositeValue = false) {
    const inputVal = values.text || "";
    if (!inputVal) {
      return "";
    }

    return `物品名${oppositeValue ? "不" : ""}包含:${inputVal}`;
  },
  // eslint-disable-next-line no-unused-vars
  filterAction(item = {}, values = {}, options = {}) {
    const inputVal = values.text || "";
    if (!inputVal) {
      return true;
    }

    const areaId = Number(selectorAreaId.value) || 0;
    const typeId = Number(selectorTypeId.value) || 0;
    const itemList = item.itemList || [];
    const itemFiltered = _.filter(itemList, (v) => {
      const itemId = Number(v.itemId) || 0;
      const itemMapId = `${areaId}-${typeId}`;
      const itemMatch = _.chain(selectorItemMap.value[itemMapId])
        .filter((v) => v.id.toString() === itemId.toString())
        .first()
        .value();
      const itemName = itemMatch?.name || "";
      return itemName.indexOf(inputVal) !== -1;
    });
    const itemNameMatch = itemFiltered.length > 0;
    return itemNameMatch;
  },
};
