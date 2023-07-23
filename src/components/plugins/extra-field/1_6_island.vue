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
  name: "ExtraField16Island",
});

defineProps({
  stages: {
    type: Array,
    default: () => [],
  },
});

const extraData = ref([]);

const extraValue = computed(() => {
  if (!_.isArray(extraData.value) || extraData.value.length <= 0) {
    return null;
  }

  return extraData.value || [];
});

const extraDataUpdate = () => {
  markerExtraEntrySetter("1_6_island", extraValue.value);
};

onMounted(() => {
  nextTick(() => {
    extraData.value = markerExtraEntryGetter("1_6_island") || [];
  });
});
</script>

<template>
  <q-item>
    <q-item-section side top> 阶段限定 </q-item-section>
    <q-item-section>
      <q-select
        v-model="extraData"
        :options="stages"
        emit-value
        map-options
        label="选择阶段"
        outlined
        dense
        multiple
        use-chips
        size="sm"
        @update:model-value="extraDataUpdate"
      />
    </q-item-section>
  </q-item>
</template>
