import { ref, nextTick } from "vue";

export const refresh_time_catagory_options = [
  { label: "不刷新", value: 0 },
  { label: "计时", value: 1 },
  { label: "特殊", value: -1 },
];

export const refresh_time_special_options = [
  { label: "手动刷新", value: -2 },
  { label: "次日4点", value: -1 },
  { label: "次日0点", value: -3 },
];

export const normalize_data = (
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

// 基础字段
export const refresh_category = ref(0);
export const refresh_hour = ref(12);
export const refresh_min = ref(0);
export const refresh_special = ref(-1);

// 更新方法
export const refresh_init = (val) => {
  nextTick().then(() => {
    const time = val || 0;
    if (time === 0) {
      refresh_category.value = 0;
      refresh_min.value = 0;
      refresh_hour.value = 12;
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
      refresh_hour.value = 12;
      refresh_special.value = time;
    }
  });
};
