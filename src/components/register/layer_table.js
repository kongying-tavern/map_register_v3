import { ref, computed } from "vue";
import { applyFilter } from "src/components/filters/data";

export const tableList = ref([]);

export const tableData = computed(() => applyFilter(tableList.value));

export const mapDisplayWithFilter = ref(false);

export const mapDisplayList = computed(() =>
  mapDisplayWithFilter.value ? tableData.value : tableList.value
);
