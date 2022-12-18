import _ from "lodash";
import { ref } from "vue";

const layer_extra_data = ref({});

const set_marker_extra_data = (data) => {
  if (_.isPlainObject(data)) {
    layer_extra_data.value = data;
  } else if (_.isString(data)) {
    try {
      const extraDataJson = JSON.parse(data);
      if (_.isPlainObject(extraDataJson)) {
        layer_extra_data.value = extraDataJson;
      } else {
        layer_extra_data.value = {};
      }
    } catch (_) {
      layer_extra_data.value = {};
    }
  }
};

const get_marker_extra_data_entry = (key = "") => layer_extra_data.value[key];

const put_marker_extra_data_entry = (key = "", data) => {
  layer_extra_data.value[key] = data;
};

export default {
  layer_extra_data,
  set_marker_extra_data,
  get_marker_extra_data_entry,
  put_marker_extra_data_entry,
};
