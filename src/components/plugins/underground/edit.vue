<script setup>
import _ from "lodash";
import { ref, computed, defineProps, onMounted, nextTick } from "vue";
import funcExtraData from "../../extra-data";

const normalize_data = (
  is_underground = false,
  model_id = "",
  region_name = "",
  region_levels = [],
  with_detail = false
) => {
  if (!is_underground) {
    return null;
  }

  if (!model_id) {
    return null;
  }

  if (with_detail) {
    region_name = region_name || "";
    region_levels = region_levels || [];
  } else {
    region_name = "";
    region_levels = [];
  }

  is_underground = Boolean(is_underground);
  model_id = model_id || "";

  return {
    is_underground,
    model_id,
    region_name,
    region_levels,
  };
};

// 组件控制
const props = defineProps({
  modelId: {
    type: String,
    required: true,
    default: "",
  },
  undergroundDetail: {
    type: Boolean,
    default: true,
  },
  undergroundOptions: {
    type: Array,
    default: () => [],
  },
});

// 定义属性
const is_underground = ref(false);
const region_name = ref("");
const region_levels = ref([]);

// 显示属性
const underground_type = computed(() =>
  is_underground.value ? "地下" : "地上"
);

const underground_options_state = computed(() => {
  const found_selector =
    _.find(props.undergroundOptions, (v) => v.value === region_name.value) ||
    {};
  const states = found_selector.children || [];
  return states;
});

// 操作方法
const underground_switch = () => {
  underground_update();
};

const underground_main_change = () => {
  region_levels.value = [];
  underground_update();
};

const underground_update = () => {
  funcExtraData.put_marker_extra_data_entry(
    "underground",
    normalize_data(
      is_underground.value,
      props.modelId,
      region_name.value,
      region_levels.value,
      props.undergroundDetail
    )
  );
};

onMounted(() => {
  nextTick().then(() => {
    const data_val =
      funcExtraData.get_marker_extra_data_entry("underground") || {};
    is_underground.value = Boolean(_.get(data_val, "is_underground", false));
    region_name.value = _.get(data_val, "region_name", "") || "";
    region_levels.value = _.get(data_val, "region_levels", []) || [];
  });
});
</script>

<template>
  <q-item>
    <q-item-section side top> 地下区域 </q-item-section>
    <q-item-section>
      <div class="row q-pb-sm content-top">
        <q-toggle
          v-model="is_underground"
          dense
          :true-value="true"
          :false-value="false"
          :label="underground_type"
          :toggle-indeterminate="false"
          @update:model-value="underground_switch"
        >
        </q-toggle>
      </div>
      <div
        v-if="is_underground && undergroundDetail"
        class="row q-gutter-x-md content-top"
      >
        <q-select
          class="col-4"
          v-model="region_name"
          :options="underground_options"
          emit-value
          map-options
          label="选择区域"
          outlined
          dense
          size="sm"
          @update:model-value="underground_main_change"
        />
        <q-select
          class="col"
          v-if="underground_options_state.length > 0"
          v-model="region_levels"
          :options="underground_options_state"
          emit-value
          map-options
          label="选择层级"
          outlined
          dense
          size="sm"
          multiple
          use-chips
          @update:model-value="underground_update"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: "PluginUndergroundEdit",
};
</script>
