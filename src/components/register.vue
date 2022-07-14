<template>
  <div class="row" style="margin-top: 10px">
    <div class="row col-12" v-show="panel" style="height: 370px">
      <div style="width: 18%">
        <!-- 地区和分类选择 -->
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
              <q-list style="min-width: 100px; max-height: 350px">
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
            v-model="selected_type_index"
            dense
            vertical
            class="text-primary"
            style="margin-top: 5px"
            @update:model-value="select_type_list"
          >
            <q-tab
              v-for="i in type_list"
              :name="i.typeId"
              :label="i.name"
              :disable="selected_area == null"
            />
          </q-tabs>
        </q-scroll-area>
      </div>
      <q-separator vertical spaced />
      <div style="width: 75%">
        <!-- 物品选择 -->
        <q-scroll-area
          :thumb-style="{ background: 'none' }"
          style="width: 100%; height: 370px"
        >
          <!-- 宝箱的额外分类 -->
          <div v-if="type_child_list.length != 0" class="row">
            <div class="col-12">
              <q-tabs
                v-model="selected_type_child_index"
                dense
                class="text-primary"
                @update:model-value="selected_item_list"
              >
                <q-tab
                  v-for="i in type_child_list"
                  :name="i.typeId"
                  :label="i.name"
                />
              </q-tabs>
            </div>

            <div class="col-12" v-show="selected_type_child_index != null">
              <q-toggle
                v-model="batch_mode"
                @update:model-value="record_chest_list"
                label="查看全部"
              />
            </div>
          </div>
          <!-- 物品单选选项组 -->
          <div class="col-12 row content-start">
            <div v-for="i in item_list" style="width: 33%">
              <q-radio
                :disable="batch_mode"
                v-model="selected_item"
                :val="i.itemId"
                :label="i.name"
                @update:model-value="select_item_layers"
              />
            </div>
          </div>
        </q-scroll-area>
      </div>
    </div>
    <div class="col-12" v-show="panel">
      <q-separator spaced />
    </div>
    <!-- 点位信息表 -->
    <div class="row col-12">
      <layer-table
        :propdata="handle_layer_list_data"
        :propitem="batch_mode == true ? 'all' : selected_item"
        @callback="table_callback"
      ></layer-table>
    </div>
    <!-- 地图上点位的弹窗 -->
    <div id="popup_window" ref="window" v-show="popup_window_show">
      <popup-window
        :map="map"
        :layer="handle_layer"
        @callback="pop_callback"
      ></popup-window>
    </div>
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
            @click="refresh_layers(), (dragmode = false)"
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 点位新增确认弹窗 -->
    <q-dialog v-model="add_mode" position="top" :seamless="true">
      <q-card style="width: 350px">
        <q-card-section> 点击地图新增点位 </q-card-section>
        <q-card-section class="row">
          <q-btn flat color="primary" label="确定"></q-btn>
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="取消"
            @click="refresh_layers"
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 点位新增/编辑弹窗 -->
    <q-dialog v-model="layer_edit_window" :persistent="true">
      <layer-edit
        :propdata="edit_data"
        @add_cancel="refresh_layers"
        @refresh="refresh"
      ></layer-edit>
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
  query_itemlayer_icon,
  query_itemlayer_infolist,
} from "../service/base_data_request";
import {
  layer_register,
  layergroup_register,
  layer_mark,
  create_icon_options,
} from "../api/layer";
import LayerTable from "./register/layer_table.vue";
import PopupWindow from "./dialogs/popup_window.vue";
import LayerEdit from "./dialogs/layer_edit_window.vue";
import { event } from "quasar";
export default {
  name: "Selector",
  data() {
    return {
      add_mode: false,
      loading: true,
      batch_mode: false,
      dragmode: false,
      drag_window: false,
      selected_area: null,
      area_list: [],
      selected_type_index: null,
      selected_type: null,
      type_list: [],
      selected_type_child_index: null,
      type_child_list: [],
      selected_item: null,
      item_list: [],
      handle_layergroup: {},
      handle_layer_list_data: [],
      handle_layer: null,
      popup_window_show: false,
      panel: true,
      edit_data: {},
      layer_edit_window: false,
      add_layer: null,
    };
  },
  methods: {
    //清除子分类和物品选择
    clearlist() {
      this.callback_list = {};
      this.batch_mode = false;
      this.layer_list = null;
      this.item_list = [];
      this.selected_type_child_index = null;
      this.type_child_list = [];
      this.selected_item = null;
      this.handle_layer_list_data = [];
    },
    //清理点位
    clearlayers() {
      this.map.removeLayer(this.handle_layergroup);
      this.handle_layergroup.clearLayers();
    },
    //切换地区
    switch_area(area) {
      this.selected_type_index = null;
      this.clearlist();
      this.clearlayers();
      this.selected_area = area;
      this.$emit("map_switch", this.selected_area);
    },
    //如果有子分类的话，进行查询，生成子分类tabs
    select_type_list(value) {
      this.loading = true;
      this.clearlayers();
      this.clearlist();

      this.selected_type = this.type_list.find((item) => item.typeId == value);
      if (!this.selected_type.isFinal) {
        query_itemtype(1, {
          current: 1,
          typeIdList: [this.selected_type.typeId],
          size: 999,
        }).then((res) => {
          this.loading = false;
          this.type_child_list = res.data.data.record;
        });
      } else {
        this.selected_item_list(value);
      }
    },
    //查询类型下属的物品列表
    selected_item_list(value) {
      this.loading = true;
      query_itemlist({
        typeIdList: [value],
        areaIdList: [this.selected_area.areaId],
        current: 0,
        size: 999,
      }).then((res) => {
        this.loading = false;
        this.item_list = res.data.data.record;
      });
    },
    //记录宝箱全选时的itemid数组
    record_chest_list(value) {
      this.selected_item = null;
      let arr = [];
      if (value) {
        for (let i of this.item_list) {
          arr.push(i.itemId);
        }
      } else {
        arr = [];
      }
      this.select_item_layers(arr);
    },
    //刷新回调
    refresh() {
      alert(1);
      this.clearlayers();
    },
    //查询点位信息
    select_item_layers(value) {
      this.clearlayers();
      this.loading = true;
      let icontag;
      if (typeof value == "number") {
        value = Array.of(value);
        icontag = Array.of(
          this.item_list.find((item) => item.itemId == value).iconTag
        );
      } else {
        icontag = [];
        for (let i of value) {
          icontag.push(this.item_list.find((item) => item.itemId == i).iconTag);
        }
      }
      //查询点位图标和点位数据
      this.$axios
        .all([
          query_itemlayer_icon({
            size: 999,
            tagList: icontag,
            typeIdList: [],
            current: 0,
          }),
          query_itemlayer_infolist({
            typeIdList: [],
            areaIdList: [],
            itemIdList: value,
            getBeta: 0,
          }),
        ])
        .then(
          this.$axios.spread((iconlist, layerlist) => {
            for (let i of layerlist.data.data) {
              let iconinfo;
              for (let j of i.itemList) {
                iconinfo = this.item_list.find(
                  (item) => item.itemId == j.itemId
                );
                if (iconinfo != undefined) {
                  let icon = iconlist.data.data.record.find(
                    (item) => item.tag == iconinfo.iconTag
                  );
                  i.icon = icon;
                }
              }
            }
            this.handle_layer_list_data = layerlist.data.data;
            this.paint_layers(this.handle_layer_list_data);
            this.loading = false;
          })
        );
    },
    //查询点位并渲染至地图上
    paint_layers(value) {
      for (let i of value) {
        console.log(i)
        this.handle_layergroup.addLayer(layer_register(i, i.icon.url));
      }
      this.layer_eventbind();
      this.map.addLayer(this.handle_layergroup);
    },
    //为点位绑定事件
    layer_eventbind() {
      //为点位绑定弹窗事件和拖动事件
      this.handle_layergroup.eachLayer((layer) => {
        layer.bindPopup(this.$refs.window);
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
        if (layer.options.data.id != draglayer.target.options.data.id) {
          layer.dragging.disable();
        }
      });
    },
    //标记点位
    mark_layer(layer) {
      let marklayer = this.handle_layergroup.getLayer(layer.target._leaflet_id);
      layer_mark(marklayer);
    },
    //聚焦点位
    focus_layer(data, zoom = 1) {
      let location = data.position.split(",");
      this.map.flyTo(location, zoom);
      let list = this.handle_layergroup.getLayers();
      for (let i of list) {
        if (i.options.data.id == data.id) {
          if (i.isPopupOpen() != true) {
            i.openPopup();
          }
        }
      }
    },
    //刷新当前点位组
    refresh_layers() {
      this.edit_data.position = "";
      this.loading = false;
      this.add_mode = false;
      this.clearlayers();
      this.paint_layers(this.handle_layer_list_data);
      this.map.off("click");
    },
    add_mode_on() {
      this.add_mode = true;
      this.loading = true;
      this.map.on("click", (event) => {
        this.add_layer = L.marker([event.latlng.lat, event.latlng.lng], {
          icon: L.icon(create_icon_options("", "unsubmit")),
        });
        this.edit_data.position = `${event.latlng.lat},${event.latlng.lng}`;
        this.handle_layergroup.addLayer(this.add_layer);
        this.add_mode = false;
        this.edit_mode(1);
      });
    },
    //编辑弹窗的模式函数
    edit_mode(type, data) {
      this.edit_data = {
        ...this.edit_data,
        type: type,
        data: data,
        list: {
          area: this.selected_area,
          type: this.selected_type,
          item: this.item_list.find(
            (item) => item.itemId == this.selected_item
          ),
          item_child: this.type_child_list,
        },
      };
      this.layer_edit_window = true;
    },
    //表格操作的回调函数
    table_callback(callback) {
      switch (callback.type) {
        case 1:
          this.add_mode = true;
          this.add_mode_on();
          // this.edit_mode(1, callback.data);
          break;
        case 2:
          this.focus_layer(callback.data);
          break;
        case 3:
          this.edit_mode(2, callback.data);
          break;
        case 5:
          this.panel = !this.panel;
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
  },
  mounted() {
    //注册点位组
    this.handle_layergroup = layergroup_register();
    //查询地区和分类
    this.$axios
      .all([
        query_area({
          parentId: -1,
          isTraverse: true,
        }),
        query_itemtype(1, {
          current: 1,
          typeIdList: [],
          size: 999,
        }),
      ])
      .then(
        this.$axios.spread((arealist, typelist) => {
          this.loading = false;
          this.area_list = [];
          for (let i of arealist.data.data) {
            if (i.isFinal) {
              this.area_list.push(i);
            }
          }
          this.type_list = typelist.data.data.record;
        })
      );
    //快捷键
    document.onkeyup = (event) => {
      if (this.$store.state.handle_type == "审核") {
        return;
      }
      switch (event.keyCode) {
        //D键，直接拖拽
        case 68:
          if (this.handle_layergroup.getLayers().length == 0) {
            alert("未选择物品，请先选择物品");
            return;
          } else if (this.dragmode == false) {
            this.handle_layergroup.eachLayer((layer) => {
              layer.dragging.enable();
            });
          }
          break;
        //`键，新增模式
        case 192:
          if (this.handle_layergroup.getLayers().length == 0) {
            alert("未选择物品，请先选择物品");
          } else if (this.add_mode == false) {
            this.add_mode_on();
          }
          break;
      }
    };
  },
  props: ["map"],
  components: {
    LayerTable,
    PopupWindow,
    LayerEdit,
  },
};
</script>

<style scoped>
#popup_window {
  width: 300px;
}
</style>