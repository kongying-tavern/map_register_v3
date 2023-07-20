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
