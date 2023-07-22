import _ from "lodash";
import { ref } from "vue";

export const markerExtra = ref({});

export const markerExtraSetter = (data) => {
  if (_.isPlainObject(data)) {
    markerExtra.value = data;
  } else if (_.isString(data)) {
    try {
      const extraDataJson = JSON.parse(data);
      if (_.isPlainObject(extraDataJson)) {
        markerExtra.value = extraDataJson;
      } else {
        markerExtra.value = {};
      }
    } catch (_) {
      markerExtra.value = {};
    }
  }
};

export const markerExtraEntryGetter = (key = "") => markerExtra.value[key];

export const markerExtraEntrySetter = (key = "", data) => {
  markerExtra.value[key] = data;
};
