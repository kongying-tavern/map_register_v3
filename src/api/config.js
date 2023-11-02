import _ from "lodash";
import { ref, computed } from "vue";
import { is_neigui } from "src/service/user_info";

export const map_editor_config = ref({});

/** 地图瓦片配置 */
export const map_tiles_norm_config = ref({});

export const map_tiles_neigui_config = ref({});

export const map_tiles_config = computed(() =>
  is_neigui.value
    ? _.defaults({}, map_tiles_neigui_config.value, map_tiles_norm_config.value)
    : map_tiles_norm_config.value
);

/** 地图插件配置 */
export const map_plugin_norm_config = ref({});

export const map_plugin_neigui_config = ref({});

export const map_plugin_config = computed(() =>
  is_neigui.value
    ? _.defaultsDeep(
        {},
        map_plugin_neigui_config.value,
        map_plugin_norm_config.value
      )
    : map_plugin_norm_config.value
);
