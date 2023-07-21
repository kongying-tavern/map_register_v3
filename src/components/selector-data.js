import { ref } from "vue";
import { filterCardVisible } from "./filters/data";

export const selectorStep = ref(1);

export const selectorCollapse = ref(false);

export const selectorToggle = () => {
  selectorCollapse.value = !selectorCollapse.value;

  if (!selectorCollapse.value && filterCardVisible.value) {
    filterCardVisible.value = false;
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
