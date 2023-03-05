<script setup>
import { ref, watch, defineProps, defineEmits, onMounted, nextTick } from "vue";

const refresh_time_catagory_options = [
  { label: "不刷新", value: 0 },
  { label: "计时", value: 1 },
  { label: "特殊", value: -1 },
];

const refresh_time_special_options = [
  { label: "手动刷新", value: -2 },
  { label: "次日4点", value: -1 },
  { label: "次日0点", value: -3 },
];

const normalize_data = (
  category_val = 0,
  hour_val = 0,
  min_val = 0,
  special_val = -1
) => {
  if (category_val === 0) {
    return 0;
  }

  if (category_val === 1) {
    return (
      (parseInt(hour_val || 0, 10) * 3600 + parseInt(min_val || 0, 10) * 60) *
      1e3
    );
  }

  if (category_val === -1) {
    return special_val;
  }

  return 0;
};

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emits = defineEmits(["update:modelValue"]);

// 基础字段
const refresh_category = ref(0);
const refresh_hour = ref(0);
const refresh_min = ref(0);
const refresh_special = ref(-1);

// 更新方法
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

const refresh_time_init = () => {
  nextTick().then(() => {
    const time = props.modelValue || 0;
    if (time === 0) {
      refresh_category.value = 0;
      refresh_min.value = 0;
      refresh_hour.value = 0;
      refresh_special.value = -1;
    } else if (time > 0) {
      refresh_category.value = 1;
      const minutes = parseInt(time / 1e3 / 60, 10);
      refresh_min.value = minutes % 60;
      refresh_hour.value = parseInt((minutes - refresh_min.value) / 60, 10);
      refresh_special.value = -1;
    } else if (time < 0) {
      refresh_category.value = -1;
      refresh_min.value = 0;
      refresh_hour.value = 0;
      refresh_special.value = time;
    }
  });
};

watch(
  () => props.modelValue,
  () => {
    refresh_time_init();
  }
);
onMounted(refresh_time_init);
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
          :options="refresh_time_special_options"
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
