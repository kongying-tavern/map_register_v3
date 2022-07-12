<template>
  <div class="row" style="margin-top: 10px">
    <div class="col-12" v-show="panel">
      <div class="row col-12" style="height: 400px">
        <div style="width: 18%">
          <q-scroll-area
            :thumb-style="{ background: 'none' }"
            style="width: 100%; height: 100%"
          >
            <q-btn
              color="primary"
              :label="selected_area == null ? '选择地区' : selected_area.name"
              style="width: 100%"
            >
              <q-menu>
                <q-list style="min-width: 100px; max-height: 400px">
                  <q-item
                    v-for="i in area_list"
                    clickable
                    v-close-popup
                    @click="switch_area(i)"
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
          </q-scroll-area>
        </div>
        <q-separator vertical spaced />
        <div style="width: 75%">
          <q-scroll-area
            :thumb-style="{ background: 'none' }"
            style="width: 100%; height: 370px"
          >
            <div class="row">
              <q-toggle
                v-if="
                  (selected_item_type == 10 || selected_item_type == 11) &&
                  item_list_options.length != 0
                "
                v-model="batch_mode"
                @update:model-value="switch_batch_mode"
                label="查看全部"
              />
            </div>
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
    <div class="col-12" style="padding-bottom: 2px">
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
            <q-btn
              color="primary"
              style="margin-right: 10px"
              @click="edit_mode(1, props.row)"
              label="新增"
            />
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
            <a href="javascript:;" @click="focus_layer(props.row)">定位</a>
            <a
              href="javascript:;"
              style="margin-left: 10px"
              @click="edit_mode(2, props.row)"
              >编辑</a
            >
            <a href="javascript:;" style="margin-left: 10px">删除</a>
          </q-td>
        </template>
      </q-table>
    </div>
    <!-- 地图上点位的弹窗 -->
    <div id="popup_window" ref="window" v-show="popup_window_show">
      <popup-window
        :map="map"
        :layer="handle_layer"
        @callback="pop_callback"
      ></popup-window>
    </div>
    <!-- 点位新增/编辑弹窗 -->
    <q-dialog v-model="layer_detail_window">
      <layer-detail-window :detail="layerinfo"></layer-detail-window>
    </q-dialog>
    <!-- 点位移动确认弹窗 -->
    <q-dialog v-model="drag_window" position="top" :persistent="true">
      <q-card style="width: 350px">
        <q-card-section> 确认将点位移动至这个位置吗？ </q-card-section>
        <q-card-section class="row">
          <q-btn flat color="primary" label="确定"></q-btn>
          <q-btn v-close-popup flat color="primary" label="继续拖动"></q-btn>
          <q-btn
            flat
            color="primary"
            label="回溯至初始位置"
            v-close-popup
            @click="paint_layers(item_list_group), (dragmode = false)"
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import {
  query_area,
  query_itemtype,
  query_itemlist,
  query_itemlayer_infolist,
  query_itemlayer_icon,
} from "../service/base_data_request";
import { layer_register, layergroup_register, layer_mark } from "../api/layer";
import PopupWindow from "./dialogs/popup_window.vue";
import LayerDetailWindow from "./dialogs/layer_detail_window.vue";
import { create_notify } from "../api/common";
export default {
  name: "LayerRegister",
  data() {
    return {
      batch_mode: false,
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
      handle_layer: null,
      handle_type: 0,
      popup_window_show: false,
      layer_detail_window: false,
      drag_window: false,
      iconinfo: {},
      layerinfo: {},
      dragmode: false,
    };
  },
  setup() {
    let handle_layergroup = null;
    return { handle_layergroup };
  },
  props: ["map"],
  components: {
    PopupWindow,
    LayerDetailWindow,
  },
  methods: {
    //清除已查询列表
    clear_list() {
      if (this.handle_layergroup != null) {
        this.map.removeLayer(this.handle_layergroup);
        this.handle_layergroup = layergroup_register();
      }
      this.layer_data = [];
    },
    switch_area(area) {
      this.selected_area = area;
      this.clear_list();
      this.selected_item_type = null;
      this.item_list_options = [];
      this.$emit("map_switch", area);
    },
    //查询物品总集列表
    select_item_list() {
      this.clear_list();
      this.batch_mode = false;
      this.item_list_options = [];
      this.loading = true;
      query_itemlist({
        typeIdList: [this.selected_item_type],
        areaIdList: [this.selected_area.areaId],
        current: 0,
        size: 999,
      }).then((res) => {
        this.loading = false;
        this.item_list_options = res.data.data.record;
      });
    },
    //查询单个物品下属所有点位
    select_item_layers(value) {
      this.batch_mode = false;
      this.layer_data = [];
      let icontag = this.item_list_options.find(
        (item) => item.itemId == value
      ).iconTag;
      //查询点位图标
      query_itemlayer_icon({
        size: 999,
        tagList: [icontag],
        typeIdList: [],
        current: 0,
      }).then((res) => {
        this.loading = false;
        this.iconinfo = {};
        if (res != undefined && res.data.data.record.length != 0) {
          this.iconinfo = res.data.data.record[0];
        }
        this.paint_layers(value);
      });
    },
    //查询点位并渲染至地图上
    paint_layers(value) {
      this.loading = true;
      this.clear_list();
      query_itemlayer_infolist({
        typeIdList: [],
        areaIdList: [],
        itemIdList: [value],
        getBeta: 0,
      }).then((res) => {
        this.loading = false;
        this.layer_data = res.data.data;
        //注册单位并生成点位组
        this.handle_layergroup = layergroup_register(
          this.layer_data,
          this.iconinfo.url
        );
        this.layer_eventbind();
        this.map.addLayer(this.handle_layergroup);
      });
    },
    //为点位绑定事件
    layer_eventbind() {
      //为点位绑定弹窗事件和拖动事件
      this.handle_layergroup.eachLayer((layer) => {
        layer.bindPopup(this.$refs.window);
        layer.on("popupopen", (layer) => {
          this.handle_layer = layer;
          this.popup_window_show = true;
        });
        layer.on({
          popupopen: (layer) => {
            this.handle_layer = layer;
            this.popup_window_show = true;
          },
          dragstart: (layer) => {
            this.dragmode = true;
            this.handle_layer = layer;
            this.unbinddrag(layer);
          },
          dragend: () => {
            this.drag_window = true;
          },
        });
      });
    },
    //解绑未选中点位的拖动
    unbinddrag(draglayer) {
      this.handle_layergroup.eachLayer((layer) => {
        if (
          layer.options.data.markerId != draglayer.target.options.data.markerId
        ) {
          layer.dragging.disable();
        }
      });
    },
    //点位编辑相关
    edit_mode(type, data) {
      this.handle_type = type;
      switch (type) {
        case 1:
          this.layerinfo = {};
          this.layer_detail_window = true;
          break;
        case 2:
          this.layerinfo = { ...data };
          this.layer_detail_window = true;
          break;
      }
    },
    //点位弹窗回调
    pop_callback(data) {
      switch (data.type) {
        case 0:
          this.edit_mode(2, data.data);
          break;
        case 1:
          this.mark_layer(data.layer);
          break;
      }
    },
    //启动全选模式
    switch_batch_mode(value) {
      if (value) {
        this.item_list_group = null;
        this.batch_layer_register();
      } else {
        this.map.removeLayer(this.handle_layergroup);
      }
    },
    //批量生成点位
    batch_layer_register() {
      this.loading = true;
      let icontag_array = [];
      for (let i of this.item_list_options) {
        icontag_array.push(i.iconTag);
      }
      //查询点位图标
      query_itemlayer_icon({
        size: 999,
        tagList: icontag_array,
        typeIdList: [],
        current: 0,
      }).then((res) => {
        let itemlist = [];
        icontag_array = [];
        for (let i of res.data.data.record) {
          let opt = this.item_list_options.find(
            (item) => item.iconTag == i.tag
          );
          icontag_array.push({
            itemId: opt.itemId,
            icontag: i.url,
          });
        }
        for (let i of icontag_array) {
          itemlist.push(i.itemId);
        }
        query_itemlayer_infolist({
          typeIdList: [],
          areaIdList: [],
          itemIdList: itemlist,
          getBeta: 0,
        }).then((res) => {
          this.layer_data = res.data.data;
          if (this.handle_layergroup != null) {
            this.map.removeLayer(this.handle_layergroup);
          }
          this.handle_layergroup = layergroup_register();
          for (let i of res.data.data) {
            let icontag = "";
            for (let j of i.itemList) {
              if (
                icontag_array.find((item) => item.itemId == j.itemId) !=
                undefined
              )
                icontag = icontag_array.find(
                  (item) => item.itemId == j.itemId
                ).icontag;
            }
            this.handle_layergroup.addLayer(layer_register(i, icontag));
          }
          this.layer_eventbind();
          this.map.addLayer(this.handle_layergroup);
          this.loading = false;
        });
      });
    },
    //聚焦点位
    focus_layer(data, zoom = 1) {
      let location = data.position.split(",");
      this.map.flyTo(location, zoom);
      let list = this.handle_layergroup.getLayers();
      for (let i of list) {
        if (i.options.data.markerId == data.markerId) {
          if (i.isPopupOpen() != true) {
            i.openPopup();
          }
        }
      }
    },
    //标记点位
    mark_layer(layer) {
      let marklayer = this.handle_layergroup.getLayer(layer.target._leaflet_id);
      layer_mark(marklayer);
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
        if (i.isFinal) {
          this.area_list.push(i);
        }
      }
      //查询所有类型
      query_itemtype(1, {
        current: 1,
        typeIdList: [],
        size: 999,
      }).then((res) => {
        console.log(res);
        this.item_type_list = [];
        for (let i of res.data.data.record) {
          if (i.isFinal == true) {
            this.item_type_list.push(i);
          } else {
            query_itemtype(1, {
              current: 1,
              typeIdList: [i.typeId],
              size: 999,
            }).then((res) => {
              for (let i of res.data.data.record) {
                this.item_type_list.push(i);
              }
            });
          }
        }
        this.loading = false;
      });
    });
    //快捷键
    document.onkeyup = (event) => {
      if (this.$store.state.handle_type == "审核") {
        return;
      }
      switch (event.keyCode) {
        //D键，直接拖拽
        case 68:
          if (this.handle_layergroup == null) {
            alert("未选择物品，请先选择物品");
          } else if (this.dragmode == false) {
            this.handle_layergroup.eachLayer((layer) => {
              layer.dragging.enable();
            });
          }
          break;
      }
    };
  },
};
</script>

<style scoped>
#popup_window {
  width: 300px;
}
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