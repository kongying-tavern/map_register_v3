<script setup>
import _ from "lodash";
import { ref, computed, onMounted, nextTick } from "vue";
import {
  markerExtraEntryGetter,
  markerExtraEntrySetter,
} from "src/components/extra-data";

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

const islandOptions = [
  { label: "无", value: "" },
  {
    label: "危危岛",
    value: "ww",
    children: [
      { label: "初始", value: "0" },
      { label: "沉入水下", value: "1" },
    ],
  },
  {
    label: "破破岛",
    value: "pp",
    children: [
      { label: "初始", value: "0" },
      { label: "低", value: "2" },
      { label: "高", value: "1" },
    ],
  },
  {
    label: "双双岛",
    value: "ss",
    children: [
      { label: "初始", value: "0" },
      { label: "最终形态", value: "3" },
    ],
  },
  {
    label: "布丁岛",
    value: "bd",
    children: [
      { label: "初始", value: "0-0" },
      { label: "任意-优悠", value: "0-1" },
      { label: "任意-浮光", value: "0-2" },
      { label: "任意-磐固", value: "0-3" },
      { label: "优悠-任意", value: "1-0" },
      { label: "浮光-任意", value: "2-0" },
      { label: "磐固-任意", value: "3-0" },
      { label: "优悠-优悠", value: "1-1" },
      { label: "优悠-浮光", value: "1-2" },
      { label: "优悠-磐固", value: "1-3" },
      { label: "磐固-优悠", value: "3-1" },
      { label: "磐固-浮光", value: "3-2" },
      { label: "磐固-磐固", value: "3-3" },
      { label: "浮光-优悠", value: "2-1" },
      { label: "浮光-浮光", value: "2-2" },
      { label: "浮光-磐固", value: "2-3" },
    ],
  },
];

const islandStates = computed(() => {
  for (const islandOption of islandOptions) {
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
          :options="islandOptions"
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

<script>
export default {
  name: "ExtraEdit28Island",
};
</script>
