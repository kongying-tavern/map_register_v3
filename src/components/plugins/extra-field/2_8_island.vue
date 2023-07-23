<script setup>
import _ from "lodash";
import {
  ref,
  computed,
  defineProps,
  defineComponent,
  onMounted,
  nextTick,
} from "vue";
import {
  markerExtraEntryGetter,
  markerExtraEntrySetter,
} from "src/components/extra-data";

defineComponent({
  name: "ExtraField28Island",
});

const props = defineProps({
  stages: {
    type: Array,
    default: () => [],
  },
});

const extraData = ref({
  island_name: "",
  island_state: [],
});

const extraValue = computed(() => {
  const island_name = extraData.value.island_name || "";
  const island_state = extraData.value.island_state || [];

  if (island_name && _.isArray(island_state) && island_state.length > 0) {
    return { island_name, island_state };
  }

  return null;
});

const islandStates = computed(() => {
  for (const islandOption of props.stages) {
    if (islandOption.value === extraData.value.island_name) {
      return islandOption.children || [];
    }
  }

  return [];
});

const extraDataInit = (extraObject = {}) => {
  extraData.value.island_name = extraObject.island_name || "";
  extraData.value.island_state = extraObject.island_state || [];
};

const extraDataSelectionClear = () => {
  extraData.value.island_state = [];
  markerExtraEntrySetter("2_8_island", extraValue.value);
};

const extraDataUpdate = () => {
  markerExtraEntrySetter("2_8_island", extraValue.value);
};

onMounted(() => {
  nextTick(() => {
    const extraData = markerExtraEntryGetter("2_8_island") || {};
    extraDataInit(extraData);
  });
});
</script>

<template>
  <q-item>
    <q-item-section side top> 所属岛屿 </q-item-section>
    <q-item-section>
      <div class="row q-gutter-x-md content-top">
        <q-select
          class="col-4"
          v-model="extraData.island_name"
          :options="props.stages"
          emit-value
          map-options
          label="选择岛屿"
          outlined
          dense
          size="sm"
          @update:model-value="extraDataSelectionClear"
        />
        <q-select
          class="col"
          v-if="islandStates.length > 0"
          v-model="extraData.island_state"
          :options="islandStates"
          emit-value
          map-options
          label="岛屿形态"
          outlined
          dense
          size="sm"
          multiple
          use-chips
          @update:model-value="extraDataUpdate"
        />
      </div>
    </q-item-section>
  </q-item>
</template>
