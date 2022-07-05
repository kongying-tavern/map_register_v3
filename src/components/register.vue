<template>
  <div class="row" style="margin-top: 10px">
    <div class="col-12" v-show="panel">
      <div class="row col-12" style="height: 400px">
        <div>
          <q-btn
            color="primary"
            :label="selected_area == null ? '选择地区' : selected_area.name"
            style="width: 100%"
          >
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  v-for="i in area_list"
                  clickable
                  v-close-popup
                  @click="selected_area = i"
                >
                  <q-item-section>{{ i.name }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-tabs
            v-model="selected_item_type"
            dense
            vertical
            class="text-primary"
            style="margin-top: 5px"
            @update:model-value="select_item_list"
          >
            <q-tab
              v-for="i in item_type_list"
              :name="i.typeId"
              :label="i.name"
              :disable="selected_area == null ? true : false"
            />
          </q-tabs>
        </div>
        <q-separator vertical spaced />
        <div style="width: 75%">
          <q-scroll-area
            :thumb-style="{ background: 'none' }"
            style="width: 100%; height: 370px"
          >
            <div class="row content-start">
              <div v-for="i in item_list_options" style="width: 33%">
                <q-radio
                  v-model="item_list_group"
                  :val="i.itemId"
                  :label="i.name"
                  @update:model-value="select_item_layers"
                />
              </div>
            </div>
          </q-scroll-area>
        </div>
      </div>
      <div class="col-12">
        <q-separator spaced />
      </div>
    </div>
    <div class="col-12">
      <q-table
        title="点位表"
        row-key="id"
        :rows="layer_data"
        :columns="layer_columns"
        selection="multiple"
        v-model:selected="selected_layer_list"
        class="table_class"
        :class="{ on: !panel }"
      >
        <!-- 表格头插槽 -->
        <template v-slot:top-right>
          <div class="layer_table row">
            <q-btn
              flat
              dense
              color="primary"
              icon="mdi-help-box"
              style="margin-right: 20px"
            >
              <q-tooltip>
                <q-markup-table
                  dark
                  :separator="'none'"
                  flat
                  style="background: none"
                >
                  <thead>
                    <tr>
                      <th class="text-center">快捷键</th>
                      <th class="text-center">功能</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-center">`</td>
                      <td class="text-center">新增点位</td>
                    </tr>
                    <tr>
                      <td class="text-center">ESC</td>
                      <td class="text-center">取消点位新增</td>
                    </tr>
                    <tr>
                      <td class="text-center">D</td>
                      <td class="text-center">拖拽点位</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              label="展开/收起筛选"
              @click="panel = !panel"
              style="margin-right: 10px"
            />
            <q-btn color="primary" style="margin-right: 10px" label="新增" />
            <q-btn color="primary" label="批量修改" />
          </div>
        </template>
        <!-- 描述插槽 -->
        <template v-slot:body-cell-content="props">
          <q-td class="text-center">
            <div class="long_text ellipsis">
              {{ props.row.content }}
              <q-tooltip v-if="props.row.content.length > 10">
                <div class="text-warp">{{ props.row.content }}</div>
              </q-tooltip>
            </div>
          </q-td>
        </template>
        <!-- 编辑插槽 -->
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center">
            <a href="javascript:;">定位</a>
            <a href="javascript:;" style="margin-left: 10px">编辑</a>
            <a href="javascript:;" style="margin-left: 10px">删除</a>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { createApp } from "vue";
import {
  query_area,
  query_itemtype,
  query_itemlist,
  query_itemlayer_infolist,
} from "../service/base_data_request";
import { layergroup_register } from "../api/layer";
import PopupWindow from "./dialogs/popup_window.vue";
export default {
  name: "LayerRegister",
  data() {
    return {
      panel: true,
      selected_area: null,
      area_list: [],
      selected_item_type: null,
      item_type_list: [],
      item_list_group: -1,
      item_list_options: [],
      loading: false,
      layer_data: [],
      layer_columns: [
        {
          name: "markerId",
          align: "center",
          label: "点位id",
          field: "markerId",
        },
        {
          name: "markerTitle",
          align: "center",
          label: "点位名称",
          field: "markerTitle",
        },
        {
          name: "content",
          align: "center",
          label: "描述",
          field: "content",
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
        },
      ],
      selected_layer_list: [],
      handle_layergroup: null,
    };
  },
  props: ["map"],
  components: {
    PopupWindow,
  },
  methods: {
    //清除已查询列表
    clear_list() {
      this.selected_item_type = null;
      this.item_list_options = [];
    },
    //查询物品总集列表
    select_item_list() {
      this.item_list_options = [];
      this.loading = true;
      query_itemlist({
        typeIdList: [this.selected_item_type],
        areaIdList: [this.selected_area.areaId],
        current: 0,
        size: 999,
      }).then((res) => {
        this.item_list_options = res.data.data.record;
        this.loading = false;
      });
    },
    //查询单个物品下属所有点位
    select_item_layers(value) {
      if (this.handle_layergroup != null) {
        this.map.removeLayer(this.handle_layergroup);
        this.handle_layergroup = null;
      }
      this.layer_data = [];
      this.loading = true;
      query_itemlayer_infolist({
        typeIdList: [],
        areaIdList: [],
        itemIdList: [value],
        getBeta: 0,
      }).then((res) => {
        this.loading = false;
        this.layer_data = res.data.data;
        this.handle_layergroup = layergroup_register(this.layer_data);
        this.handle_layergroup.eachLayer((layer) => {
          this.layer_window_register(layer);
        });
        this.map.addLayer(this.handle_layergroup);
      });
    },

    //为点位绑定弹窗
    layer_window_register(layer) {
      //需要指定一个dom元素用于绑定组件，且需要为其指定宽度，否则leaflet弹窗无法获取容器宽度导致组件内容无法完全展示
      layer.bindPopup(`123`);
      //   layer.on("popupopen", () => {
      //     let app = createApp(PopupWindow, {
      //       map: this.map,
      //       layer_detail: layer,
      //     });
      //     //使用createApp将popup组件挂载至popup弹窗内id为popup_window的dom对象上
      //     app.mount("#popup_window");
      //   });
    },
  },
  mounted() {
    //查询所有地区
    query_area({
      parentId: -1,
      isTraverse: true,
    }).then((res) => {
      this.area_list = [];
      for (let i of res.data.data) {
        if (i.parentId != -1) {
          this.area_list.push(i);
        }
      }
      //查询所有类型
      query_itemtype(1, {
        current: 1,
        typeIdList: [],
        size: 999,
      }).then((res) => {
        this.item_type_list = [];
        this.item_type_list = res.data.data.record;
        this.loading = false;
      });
    });
  },
};
</script>

<style scoped>
.long_text {
  width: 150px;
  margin: 0 auto;
  text-align: center;
}
.text-warp {
  width: 200px;
  white-space: pre-wrap; /* CSS 2.1 */
  word-wrap: break-word;
}
.table_class {
  width: 99%;
  margin: 0 auto;
  max-height: 48vh;
}
.table_class.on {
  max-height: 92vh;
}
</style>