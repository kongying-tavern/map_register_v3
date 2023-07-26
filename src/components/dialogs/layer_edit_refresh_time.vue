<script setup>
import { defineEmits, defineProps, onMounted, nextTick } from "vue";
import {
  normalize_data,
  refresh_time_catagory_options,
  refresh_category,
  refresh_hour,
  refresh_min,
  refresh_special,
  refresh_init,
} from "./layer_edit_refresh_time";
import { map_editor_config } from "src/api/config";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emits = defineEmits(["update:modelValue"]);

const refresh_time_update = () => {
  emits(
    "update:modelValue",
    normalize_data(
      refresh_category.value,
      refresh_hour.value,
      refresh_min.value,
      refresh_special.value
    )
  );
};

const refresh_category_update = () => {
  refresh_time_update();
};

onMounted(() => {
  nextTick().then(() => {
    refresh_init(props.modelValue);
  });
});
</script>

<template>
  <q-item>
    <q-item-section side top>刷新时间</q-item-section>
    <q-item-section>
      <div class="row q-pb-sm content-top q-gutter-x-md field">
        <q-select
          class="col-4"
          v-model="refresh_category"
          :options="refresh_time_catagory_options"
          emit-value
          map-options
          label="选择类别"
          outlined
          dense
          size="sm"
          @update:model-value="refresh_category_update"
        >
        </q-select>

        <!-- 计时 -->
        <template v-if="refresh_category === 1">
          <q-input
            class="col-3"
            v-model.number="refresh_hour"
            dense
            outlined
            @update:model-value="refresh_time_update"
          >
            <template #append>
              <span class="append-text">时</span>
            </template>
          </q-input>
          <q-input
            class="col-3"
            v-model.number="refresh_min"
            dense
            outlined
            @update:model-value="refresh_time_update"
          >
            <template #append>
              <span class="append-text">分</span>
            </template>
          </q-input>
        </template>
        <!-- 特殊 -->
        <q-select
          v-else-if="refresh_category === -1"
          class="col-4"
          v-model="refresh_special"
          :options="map_editor_config?.refreshTimeSpecial || []"
          emit-value
          map-options
          label="选择时间"
          outlined
          dense
          size="sm"
          @update:model-value="refresh_time_update"
        >
        </q-select>
      </div>
    </q-item-section>
  </q-item>
</template>

<style lang="scss" scoped>
.field :deep(.append-text) {
  font-size: 1rem;
}
</style>
