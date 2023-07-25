import _ from "lodash";
import { ref } from "vue";
import { filterCardVisible } from "./filters/data";

export const selectorCollapse = ref(false);

export const selectorCacheFilterVisible = ref(false);

export const selectorStep = ref(1);

export const selectorToggle = (state) => {
  selectorCollapse.value = _.isNil(state)
    ? !selectorCollapse.value
    : Boolean(state);

  if (!selectorCollapse.value && filterCardVisible.value) {
    selectorCacheFilterVisible.value = filterCardVisible.value;
    filterCardVisible.value = false;
  } else if (selectorCollapse.value) {
    filterCardVisible.value = selectorCacheFilterVisible.value;
  }
};

export const selectorJumpPrev = () => {
  selectorStep.value -= 1;
};

export const selectorJumpNext = () => {
  selectorStep.value += 1;
};

export const selectorJumpTo = (step = 1) => {
  selectorStep.value = step;
};
