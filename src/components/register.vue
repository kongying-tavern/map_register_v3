<template>
  <div class="absolute-full marker-action-container">

    <!-- 地区和分类选择 -->
    <q-stepper
      v-model="selector_step"
      class="full-width marker-action-stepper flex-none"
      header-nav
      bordered
      animated>
      <q-step
        :name="1"
        title="选择地区"
        :caption="`当前选择：${selected_area_name}`"
        icon="place"
        active-icon="place"
        :done="selector_step === 1">
        <div class="q-gutter-md">
          <q-btn
            v-for="i in area_list"
            v-show="i.name.indexOf('阶段') === -1"
            :color="selected_area_id === i.areaId ? 'primary': 'white'"
            :text-color="selected_area_id === i.areaId ? 'white': 'black'"
            @click="switch_area(i)">
            <q-item-section>{{ i.name }}</q-item-section>
          </q-btn>
        </div>
      </q-step>

      <q-step
        :name="2"
        title="选择分类"
        :caption="`当前选择：${selected_type_name}`"
        icon="bookmarks"
        active-icon="bookmarks"
        :done="selector_step === 2">
        <div v-if="selected_area_id <= 0">
          尚未选择地区，请
          <q-chip
            outline
            square
            color="primary"
            clickable
            text-color="white"
            icon="place"
            @click="() => { selector_step = 1; }">
            前去选择
          </q-chip>
        </div>
        <div v-else class="q-gutter-md">
          <template v-for="i in type_list">
            <q-btn
              v-if="i.isFinal"
              :color="selected_type_id === i.typeId ? 'primary': 'white'"
              :text-color="selected_type_id === i.typeId ? 'white': 'black'"
              @click="select_type_list(i)">
              <q-item-section>{{ i.name }}</q-item-section>
            </q-btn>
            <q-btn-dropdown
              v-else
              :label="i.name"
              :color="type_child_ids.indexOf(selected_type_id) !== -1 ? 'primary': 'white'"
              :text-color="type_child_ids.indexOf(selected_type_id) !== -1 ? 'white': 'black'"
              dropdown-icon="change_history">
              <q-list>
                <q-item
                  v-for="j in type_child_list"
                  :class="[
                    j.typeId === selected_type_id ? 'bg-blue': 'bg-white',
                    j.typeId === selected_type_id ? 'text-white': 'text-black'
                  ].join(' ')"
                  clickable
                  @click="select_type_list(j)">
                  <q-item-section>{{ j.name }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
        </div>
      </q-step>

      <q-step
        :name="3"
        title="选择物品"
        icon="pets"
        active-icon="pets"
        :done="selector_step === 3">
        <div v-if="selected_area_id <= 0">
          尚未选择地区，请
          <q-chip
            outline
            square
            color="primary"
            clickable
            text-color="white"
            icon="place"
            @click="() => { selector_step = 1; }">
            前去选择
          </q-chip>
        </div>
        <div v-else-if="selected_type_id <= 0">
          尚未选择分类，请
          <q-chip
            outline
            square
            color="primary"
            clickable
            text-color="white"
            icon="bookmarks"
            @click="() => { selector_step = 2; }">
            前去选择
          </q-chip>
        </div>
        <q-scroll-area
          v-else
          :thumb-style="{ background: 'none' }"
          style="width: 100%; height: 220px;">
          <div class="row">
            <div class="col-4">
              <q-radio
                v-model="selected_item"
                :val="null"
                label="全部"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                @update:model-value="select_item_layers">
              </q-radio>
            </div>
            <div
              v-for="i in item_list"
              class="col-4">
              <q-radio
                v-model="selected_item"
                :val="i"
                :label="i.name"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                @update:model-value="select_item_layers">
              </q-radio>
            </div>
          </div>
        </q-scroll-area>
      </q-step>
    </q-stepper>

    <q-separator spaced class="flex-none" />

    <!-- 点位信息表 -->
    <layer-table
      class="full-width flex-auto"
      :propdata="handle_layer_list_data"
      :propitem="selected_item"
      @callback="table_callback">
    </layer-table>

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
          <q-btn
            flat
            color="primary"
            label="确定"
            @click="upload_position"
          ></q-btn>
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
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="取消"
            @click="add_mode_off"
          ></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 点位新增/编辑弹窗 -->
    <q-dialog
      v-model="layer_edit_window"
      :persistent="handle_type == 1 ? true : false"
    >
      <layer-edit
        :propdata="edit_data"
        @cancel="add_mode_off"
        @refresh="refresh"
      ></layer-edit>
    </q-dialog>
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import _ from 'lodash'
import {
  query_area,
  query_itemtype,
  query_itemlist,
  query_itemlayer_icon,
  query_itemlayer_infolist,
  check_img,
} from "../service/base_data_request";
import { get_user_id } from "../service/user_info";
import {
  layer_register,
  layergroup_register,
  layer_mark,
  create_icon_options,
} from "../api/layer";
import { edit_layer } from "../service/edit_request";
import { delete_layer } from "../service/edit_request";
import LayerTable from "./register/layer_table.vue";
import PopupWindow from "./dialogs/popup_window.vue";
import LayerEdit from "./dialogs/layer_edit_window.vue";
import { create_notify } from "../api/common";
export default {
  name: "Selector",
  data() {
    return {
      add_mode: false,
      loading: true,
      dragmode: false,
      drag_window: false,

      selector_step: 1,
      selected_area: null,
      selected_type: null,
      selected_item: null,

      area_list: [],
      type_list: [],
      type_child_list: [],
      item_list: [],

      stepper_collapsed: false,
      handle_layer_list_data: [],
      handle_layer: null,
      popup_window_show: false,
      edit_data: {},
      layer_edit_window: false,
      new_layer_id: 0,
      handle_type: 0,
      mark_layer_set: [],
    };
  },
  computed: {
    selected_area_id() {
      return (this.selected_area || {}).areaId || 0;
    },
    selected_area_name() {
      return (this.selected_area || {}).name || ''
    },
    selected_type_id() {
      return (this.selected_type || {}).typeId || 0;
    },
    selected_type_name() {
      return (this.selected_type || {}).name || '';
    },
    selected_item_id() {
      return (this.selected_item || {}).itemId || 0;
    },
    selected_item_name() {
      return (this.selected_item || {}).name || '';
    },
    selected_item_icontag() {
      return (this.selected_item || {}).iconTag || '';
    },
    type_child_ids() {
      return _.map(this.type_child_list || [], v => v.typeId)
    },
    item_ids() {
      return _.map(this.item_list || [], v => v.itemId);
    },
    item_icontags() {
      return _.chain(this.item_list || []).map(v => v.iconTag).filter(v => v).value();
    },
    item_icontag_map() {
      return _.chain(this.item_list || []).filter(v => v && v.iconTag).map(v => [v.itemId, v.iconTag]).fromPairs().value();
    }
  },
  methods: {
    //清除子分类和物品选择
    clearlist() {
      this.callback_list = {};
      this.layer_list = null;
      this.item_list = [];
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
      this.selected_type = null;
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
      this.selected_type = value;
      this.select_item_list(value.typeId);
    },
    //查询类型下属的物品列表
    select_item_list(value) {
      this.loading = true;
      query_itemlist({
        typeIdList: [value],
        areaIdList: [this.selected_area_id],
        current: 0,
        size: 999,
      }).then((res) => {
        this.loading = false;
        this.item_list = res.data.data.record;
        this.select_item_layers(null);
      });
    },
    //查询点位信息
    select_item_layers(value) {
      this.clearlayers();
      this.loading = true;
      this.selected_item = value;

      let icon_tags = this.selected_item_id <= 0 ? this.item_icontags : [this.selected_item_icontag]
      let item_ids = this.selected_item_id <= 0 ? this.item_ids : [this.selected_item_id]

      let icon_getter = icon_tags.length > 0 ?
        query_itemlayer_icon({
          size: 999,
          tagList: icon_tags,
          typeIdList: [],
          current: 0,
        }) : Promise.resolve({data: {data: {record: []}}});
      let item_getter = item_ids.length > 0 ?
        query_itemlayer_infolist({
          typeIdList: [],
          areaIdList: [],
          itemIdList: item_ids,
          getBeta: 0,
        }) : Promise.resolve({data: {data: []}})

      //查询点位图标和点位数据
      this.$axios
        .all([
          icon_getter,
          item_getter,
        ])
        .then(
          this.$axios.spread((iconlist, layerlist) => {
            let icon_records = iconlist.data.data.record || [];
            let layer_records = layerlist.data.data || [];
            let icon_map = _.chain(icon_records).map(v => [v.tag, v]).fromPairs().value();
            let layer_record_list = _.map(layer_records, v => {
              let itemId = _.get(v, 'itemList.0.itemId', 0);
              let itemIconTag = this.item_icontag_map[itemId] || ''
              let iconDefault = {url: ''};
              let icon = itemIconTag ? (icon_map[itemIconTag] || iconDefault) : iconDefault;
              v.icon = icon;
              return v;
            });

            this.handle_layer_list_data = layer_record_list;
            this.paint_layers(this.handle_layer_list_data);
            this.loading = false;
          })
        );
    },
    //查询点位并渲染至地图上
    paint_layers(value) {
      for (let i of value) {
        this.handle_layergroup.addLayer(
          layer_register(i, i.icon.url == undefined ? "" : i.icon.url)
        );
      }
      this.layer_eventbind();
      this.map.addLayer(this.handle_layergroup);
    },
    //为点位绑定事件
    layer_eventbind() {
      //为点位绑定弹窗事件和拖动事件
      this.handle_layergroup.eachLayer((layer) => {
        let layerid = layer.options.data.id;
        let marklist = JSON.parse(localStorage.getItem("marked_layers"));
        if (marklist.findIndex((item) => item == layerid) != -1) {
          layer_mark(layer);
        }
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
          dragend: (layer) => {
            this.drag_window = true;
            this.handle_layer = layer;
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
      let layerid = layer.target.options.data.id;
      let arr = JSON.parse(localStorage.getItem("marked_layers"));
      let index = arr.findIndex((item) => item == layerid);
      if (index == -1) {
        arr.push(layerid);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      } else {
        arr.splice(index, 1);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      }
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
      this.clearlayers();
      this.paint_layers(this.handle_layer_list_data);
    },
    //添加模式
    add_mode_on() {
      this.add_mode = true;
      this.loading = true;
      this.map.on("click", (event) => {
        let marker = L.marker([event.latlng.lat, event.latlng.lng], {
          icon: L.icon(create_icon_options("")),
        });
        this.handle_layergroup.addLayer(marker);
        this.new_layer_id = marker._leaflet_id;
        this.edit_mode(1, undefined, `${event.latlng.lat},${event.latlng.lng}`);
      });
    },
    //添加模式
    add_mode_off() {
      this.add_mode = false;
      this.loading = false;
      this.map.off("click");
      if (this.new_layer_id != 0) {
        this.handle_layergroup.removeLayer(this.new_layer_id);
        this.new_layer_id = 0;
      }
    },
    //编辑弹窗的模式函数
    edit_mode(type, data, position) {
      this.handle_type = type;
      this.edit_data = {
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
        position: position,
      };
      this.layer_edit_window = true;
    },
    //表格操作的回调函数
    table_callback(callback) {
      switch (callback.type) {
        case 1:
          this.add_mode_on(true);
          // this.edit_mode(1, callback.data);
          break;
        case 2:
          this.focus_layer(callback.data);
          break;
        case 3:
          this.edit_mode(2, callback.data);
          break;
        case 4:
          this.delete_layer(callback.data);
          break;
        case 5:
          this.stepper_collapsed = !this.stepper_collapsed;
          break;
        case 6:
          this.refresh();
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
        case 2:
          this.handle_layergroup.eachLayer((layer) => {
            layer.dragging.enable();
          });
          break;
        case 3:
          this.delete_layer(data.data);
          break;
      }
    },
    //完成后，刷新当前点位
    refresh() {
      this.add_mode_off();
      this.layer_edit_window = false;
      this.select_item_layers(this.selected_item);
    },
    //删除点位
    delete_layer(data) {
      if (confirm("你确定要删除这个点位么，该操作不可撤销") == true) {
        delete_layer(data.id).then((res) => {
          create_notify(res.data.message);
          this.refresh();
        });
      }
    },
    //提交点位位置改动
    upload_position() {
      let position = this.handle_layer.target._latlng;
      position = `${position.lat},${position.lng}`;
      edit_layer({
        position: position,
        id: this.handle_layer.target.options.data.id,
        markerCreatorId: get_user_id(),
      }).then((res) => {
        this.dragmode = false;
        this.drag_window = false;
        this.refresh();
        create_notify(res.data.message);
      });
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
      )
      .then(() => {
        let type_not_final = _.find(this.type_list, v => !v.isFinal)
        if(type_not_final) {
          return query_itemtype(1, {
            current: 1,
            typeIdList: [type_not_final.typeId],
            size: 999,
          }).then((res) => {
            this.loading = false;
            this.type_child_list = res.data.data.record;
          });
        }
      })
      ;
    //快捷键
    document.onkeyup = (event) => {
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

<style>
.q-scrollarea__content {
  width: 100%;
}
</style>

<style scoped>
#popup_window {
  width: 300px;
}
</style>

<style lang="scss" scoped>
.marker-action-container {
  display: flex;
  flex-direction: column;
  .marker-action-stepper {}
  .flex-none {
    flex: none;
    position: relative;
  }
  .flex-auto {
    flex: auto;
    position: relative;
  }
}
</style>
