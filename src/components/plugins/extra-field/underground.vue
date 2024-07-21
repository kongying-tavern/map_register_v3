<script setup>
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
  name: "ExtraFieldUnderground",
});

const props = defineProps({
  textInactive: {
    type: String,
    default: "地面",
  },
  textActive: {
    type: String,
    default: "非地面",
  },
  undergroundDetail: {
    type: Boolean,
    default: false,
  },
  undergroundLevels: {
    type: Array,
    default: () => [],
  },
});

const extraData = ref({
  is_underground: false,
  region_levels: [],
});
const extraRegionName = ref("");

const extraValue = computed(() => {
  if (!extraData.value.is_underground) {
    return null;
  }

  const is_underground = Boolean(extraData.value.is_underground);
  const region_levels = props.undergroundDetail
    ? extraData.value.region_levels || []
    : [];
  return { is_underground, region_levels };
});

const undergroundText = computed(() =>
  extraData.value.is_underground ? props.textActive : props.textInactive
);

const undergroundSubLevels = computed(() => {
  for (const regionGroup of props.undergroundLevels) {
    if (regionGroup.value === extraRegionName.value) {
      return regionGroup.children || [];
    }
  }

  return [];
});

const regionGroupRevMap = computed(() => {
  const retrieveMap = {};
  for (const regionGroup of props.undergroundLevels) {
    const regionChildren = regionGroup.children || [];
    for (const regionItem of regionChildren) {
      const regionItemVal = regionItem.value || "";
      retrieveMap[regionItemVal] = regionGroup.value || "";
    }
  }

  return retrieveMap;
});

const extraDataInit = (extraObject = {}) => {
  extraData.value.is_underground = Boolean(extraObject.is_underground);
  extraData.value.region_levels = extraObject.region_levels || [];

  const firstRegionLevel = extraData.value.region_levels[0] || "";
  extraRegionName.value = regionGroupRevMap.value[firstRegionLevel] || "";
};

const extraDataSelectionClear = () => {
  extraData.value.region_levels = [];
  markerExtraEntrySetter("underground", extraValue.value);
};

const extraDataUpdate = () => {
  markerExtraEntrySetter("underground", extraValue.value);
};

onMounted(() => {
  nextTick(() => {
    const extraData = markerExtraEntryGetter("underground") || {};
    extraDataInit(extraData);
  });
});
</script>

<template>
  <q-item>
    <q-item-section side top> 分层层级 </q-item-section>
    <q-item-section>
      <div class="row q-pb-sm content-top">
        <q-toggle
          v-model="extraData.is_underground"
          dense
          :true-value="true"
          :false-value="false"
          :label="undergroundText"
          :toggle-indeterminate="false"
          @update:model-value="extraDataUpdate"
        >
        </q-toggle>
      </div>
      <div
        v-if="extraData.is_underground && undergroundDetail"
        class="row q-gutter-x-md content-top"
      >
        <q-select
          class="col-4"
          v-model="extraRegionName"
          :options="undergroundLevels"
          emit-value
          map-options
          label="选择区域"
          outlined
          dense
          size="sm"
          @update:model-value="extraDataSelectionClear"
        />
        <q-select
          class="col"
          v-if="undergroundSubLevels.length > 0"
          v-model="extraData.region_levels"
          :options="undergroundSubLevels"
          emit-value
          map-options
          label="选择层级"
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
