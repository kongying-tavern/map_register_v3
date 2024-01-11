<!--
 * @Description:
 * @Author: HuangWenXin
 * @Date: 2022-07-19 10:30:27
 * @LastEditors: HuangWenXin
 * @LastEditTime: 2022-07-19 18:40:02
-->
<template>
  <div id="opened_popup row">
    <div class="text">
      <p>{{ layer_data.markerTitle }} id:{{ layer_data.id }}</p>
      <q-img
        class="layer_img"
        :src="
          layer_data.picture == ''
            ? `${VITE_ASSET_BASE}/images/noImage.png`
            : layer_data.picture
        "
        spinner-color="primary"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-primary text-white">
            没有相关图片
          </div>
        </template>
      </q-img>
      <div style="font-size: 1rem">
        <div>点位描述：</div>
        <div class="text_nl">{{ layer_data.content }}</div>
      </div>
      <p>点位显示状态：{{ layer_hidden }}</p>
    </div>
    <div class="btns row justify-between">
      <template v-for="(item, index) in btn_labels">
        <q-btn
          v-if="typeof item.validate === 'function' && !!item.validate()"
          flat
          :label="item.label"
          :key="index"
          @click="callback_handle(index)"
          color="primary"
        >
        </q-btn>
      </template>
    </div>
  </div>
</template>

<script>
import { is_admin } from "src/service/user_info";

export default {
  name: "PopupWindow",
  setup() {
    return {
      VITE_ASSET_BASE: import.meta.env.VITE_ASSET_BASE,
    };
  },
  data() {
    return {
      layer_data: {},
      btn_labels: [
        { label: "修改", validate: () => true },
        { label: "标记", validate: () => true },
        { label: "更改坐标", validate: () => true },
        { label: "删除", validate: () => is_admin.value },
      ],
    };
  },
  props: ["layer", "map"],
  methods: {
    // 向父组件传递事件类型
    callback_handle(type) {
      this.$emit("callback", {
        type,
        layer: this.layer,
        data: this.layer_data,
      });
    },
    // 标记点位
    mark_layer() {},
  },
  mounted() {},
  computed: {
    layer_hidden() {
      if (this.layer !== null && this.layer_data !== null) {
        let hiddenState = "";
        switch (this.layer_data.hiddenFlag) {
          case 0:
            hiddenState = "显示";
            break;
          case 1:
            hiddenState = "隐藏";
            break;
          case 2:
            hiddenState = "内鬼";
            break;
          default:
            hiddenState = "未知";
            break;
        }

        return hiddenState;
      }

      return "未知";
    },
  },
  watch: {
    layer(val) {
      this.layer_data = val.target.options.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.text_nl {
  white-space: pre-wrap;
  word-wrap: break-word;
}

p {
  margin: 10px auto;
  font-size: 16px;
}
</style>
<style>
.leaflet-popup-content {
  width: 100% !important;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.leaflet-popup-close-button {
  zoom: 2;
}
</style>
