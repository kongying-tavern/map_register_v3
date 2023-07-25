<script setup>
import {
  selectorStep,
  selectorJumpPrev,
  selectorJumpNext,
  selectorJumpTo,
  selectorCollapse,
  selectorToggle,
} from "./selector-data";
import FilterCard from "src/components/filters/filter-card.vue";
import FilterShare from "src/components/filters/filter-share.vue";

import { layer_edit_window } from "src/components/dialogs/layer_edit_window";
</script>

<template>
  <div class="absolute-full marker-action-container">
    <!-- 地区和分类选择 -->
    <q-stepper
      v-model="selectorStep"
      class="full-width flex-none"
      header-class="stepper-header"
      header-nav
      flat
      bordered
      animated
    >
      <q-step
        class="marker-action-step"
        :class="{ hidden: selectorCollapse }"
        :name="1"
        title="选择地区"
        :caption="`当前选择：${selected_area_name}`"
        icon="place"
        active-icon="place"
        :active-color="selectorCollapse ? 'blue-10' : 'primary'"
        done-icon="place"
        :done-color="selectorCollapse ? 'blue-10' : 'primary'"
        :done="selectorCollapse || selectorStep === 1"
        :header-nav="!selectorCollapse"
      >
        <div style="display: flex" class="absolute-full q-pa-sm">
          <q-list style="flex: 4; overflow-y: auto" dense>
            <template v-for="(i, idx) in area_list_top" :key="idx">
              <q-separator v-if="idx > 0"></q-separator>
              <q-item
                clickable
                :active="test_area_select(i)"
                active-class="bg-primary text-white"
                @click="switch_area(i)"
              >
                <q-item-section>{{ i.name }}</q-item-section>
                <q-item-section avatar>
                  <q-avatar
                    v-if="i.hiddenFlag === 1"
                    size="md"
                    icon="visibility_off"
                  />
                  <q-avatar
                    v-else-if="i.hiddenFlag === 2"
                    size="md"
                    icon="lens_blur"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
          <q-list
            v-if="area_list_child.length > 0"
            style="flex: 5; overflow-y: auto"
            dense
          >
            <template v-for="(i, idx) in area_list_child" :key="idx">
              <q-separator v-if="idx > 0"></q-separator>
              <q-item
                clickable
                :active="test_area_select(i)"
                active-class="bg-primary text-white"
                @click="switch_area(i)"
              >
                <q-item-section>{{ i.name }}</q-item-section>
                <q-item-section avatar>
                  <q-avatar
                    v-if="i.hiddenFlag === 1"
                    size="md"
                    icon="visibility_off"
                  />
                  <q-avatar
                    v-else-if="i.hiddenFlag === 2"
                    size="md"
                    icon="lens_blur"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </div>
      </q-step>

      <q-step
        class="marker-action-step"
        :class="{ hidden: selectorCollapse }"
        :name="2"
        title="选择分类"
        :caption="`当前选择：${selected_type_name}`"
        icon="bookmarks"
        active-icon="bookmarks"
        :active-color="selectorCollapse ? 'blue-10' : 'primary'"
        done-icon="bookmarks"
        :done-color="selectorCollapse ? 'blue-10' : 'primary'"
        :done="selectorCollapse || selectorStep === 2"
        :header-nav="!selectorCollapse"
      >
        <div v-if="selected_area_id <= 0">
          尚未选择地区，请
          <q-chip
            outline
            square
            color="primary"
            clickable
            text-color="white"
            icon="place"
            @click="selectorJumpTo(1)"
          >
            前去选择
          </q-chip>
        </div>
        <q-scroll-area
          v-else
          class="absolute-full q-pa-md"
          :bar-style="scroll_area_bar_style"
          :thumb-style="scroll_area_thumb_style"
        >
          <div class="q-gutter-md">
            <template v-for="(i, idx) in type_list" :key="idx">
              <q-btn
                v-if="i.isFinal"
                :color="selected_type_id === i.typeId ? 'primary' : 'white'"
                :text-color="selected_type_id === i.typeId ? 'white' : 'black'"
                @click="select_type_list(i)"
              >
                <q-item-section>{{ i.name }}</q-item-section>
              </q-btn>
              <q-btn-dropdown
                v-else
                :label="i.name"
                :color="
                  type_child_ids.indexOf(selected_type_id) !== -1
                    ? 'primary'
                    : 'white'
                "
                :text-color="
                  type_child_ids.indexOf(selected_type_id) !== -1
                    ? 'white'
                    : 'black'
                "
                dropdown-icon="change_history"
              >
                <q-list>
                  <q-item
                    v-for="(j, idxChild) in type_child_list"
                    :key="idxChild"
                    :class="
                      [
                        j.typeId === selected_type_id ? 'bg-blue' : 'bg-white',
                        j.typeId === selected_type_id
                          ? 'text-white'
                          : 'text-black',
                      ].join(' ')
                    "
                    clickable
                    @click="select_type_list(j)"
                  >
                    <q-item-section>{{ j.name }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
          </div>
        </q-scroll-area>
      </q-step>

      <q-step
        class="marker-action-step"
        :class="{ hidden: selectorCollapse }"
        :name="3"
        title="选择物品"
        :caption="`当前选择：${selected_item_name}`"
        icon="pets"
        active-icon="pets"
        :active-color="selectorCollapse ? 'blue-10' : 'primary'"
        done-icon="pets"
        :done-color="selectorCollapse ? 'blue-10' : 'primary'"
        :done="selectorCollapse || selectorStep === 3"
        :header-nav="!selectorCollapse"
      >
        <div v-if="selected_area_id <= 0">
          尚未选择地区，请
          <q-chip
            outline
            square
            color="primary"
            clickable
            text-color="white"
            icon="place"
            @click="selectorJumpTo(1)"
          >
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
            @click="selectorJumpTo(2)"
          >
            前去选择
          </q-chip>
        </div>
        <q-scroll-area
          v-else
          class="absolute-full q-pa-sm"
          :bar-style="scroll_area_bar_style"
          :thumb-style="scroll_area_thumb_style"
        >
          <div class="row">
            <div
              v-if="item_all_allowable"
              class="col-4 cursor-pointer item-entry"
              @click="
                () => {
                  selected_item = null;
                  fetch_item_layers(null);
                }
              "
            >
              <q-radio
                v-model="selected_item"
                :val="null"
                label="全部"
                dense
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                @update:model-value="fetch_item_layers"
              >
              </q-radio>
            </div>
            <div
              v-for="(i, idx) in item_list"
              :key="idx"
              class="col-4 cursor-pointer item-entry"
              :class="{ active: selected_item_id === i.itemId }"
              @click="
                () => {
                  selected_item = i;
                  fetch_item_layers(i);
                }
              "
            >
              <q-radio
                v-model="selected_item"
                :val="i"
                :label="i.name"
                dense
                size="lg"
                :keep-color="false"
                :checked-icon="`img:${get_icon_url_by_tag(i.iconTag)}`"
                :unchecked-icon="`img:${get_icon_url_by_tag(i.iconTag)}`"
                @update:model-value="fetch_item_layers"
              >
              </q-radio>
            </div>
          </div>
        </q-scroll-area>
      </q-step>

      <!-- 步骤下部导航部分 -->
      <template #navigation>
        <q-stepper-navigation class="flex-none" style="padding: 10px 8px">
          <div class="marker-action-toggle">
            <q-space v-if="selectorCollapse"></q-space>
            <div v-else class="flex-auto q-gutter-md">
              <q-btn
                v-if="selectorStep > 1"
                label="上一步"
                icon="arrow_back"
                color="primary"
                size="sm"
                rounded
                glossy
                @click="selectorJumpPrev()"
              >
              </q-btn>

              <q-btn
                v-if="selectorStep < 3"
                label="下一步"
                icon-right="arrow_forward"
                color="primary"
                size="sm"
                rounded
                glossy
                @click="selectorJumpNext()"
              >
              </q-btn>
            </div>
            <span
              class="flex-none cursor-pointer text text-bold text-right text-grey-8"
              @click="selectorToggle()"
            >
              <q-icon :name="stepper_collapse_icon" right></q-icon>
              {{ stepper_collapse_text }}
            </span>
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <!-- 过滤-->
    <div class="flex-none">
      <FilterShare></FilterShare>
      <FilterCard></FilterCard>
    </div>

    <!-- 点位信息表 -->
    <layer-table
      class="full-width flex-auto"
      :propdata="handle_layer_list_data"
      :propitem="selected_item"
      :itemlist="item_full_list"
      @callback="table_callback"
    >
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
        :basic-types="type_map"
        :basic-icon="icon_map"
        :basic-items="item_patched_list"
        :sel-area="selected_area"
        :sel-type="selected_type"
        :sel-item="selected_item"
        :propdata="edit_data"
        @cancel="add_mode_off"
        @refresh="refresh"
      >
      </layer-edit>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import _ from "lodash";
import { map } from "src/pages/map";
import {
  query_area,
  query_itemtype,
  query_itemlist,
  query_itemlayer_icon,
  query_itemlayer_infolist,
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
  name: "DialogSelector",
  data() {
    return {
      scroll_area_bar_style: {
        width: "10px",
        borderRadius: "5px",
        backgroundColor: "#dedede",
        opacity: 0.3,
      },
      scroll_area_thumb_style: {
        width: "6px",
        borderRadius: "3px",
        backgroundColor: "#dadada",
        margin: "2px",
        opacity: 1,
      },

      add_mode: false,
      loading: true,
      dragmode: false,
      drag_window: false,

      selected_top_area_id: null,
      selected_area: null,
      selected_type: null,
      selected_item: null,

      area_list: [],
      type_list: [],
      type_child_list: [],
      item_full_list: [],

      icon_map: {},

      handle_layer_list_data: [],
      handle_layer: null,
      popup_window_show: false,
      edit_data: {},
      new_layer_id: 0,
      handle_type: 0,
      handle_layergroup: null,
      mark_layer_set: [],
    };
  },
  computed: {
    selected_area_id() {
      return (this.selected_area || {}).areaId || 0;
    },
    selected_area_name() {
      return (this.selected_area || {}).name || "";
    },
    selected_type_id() {
      return (this.selected_type || {}).typeId || 0;
    },
    selected_type_name() {
      return (this.selected_type || {}).name || "";
    },
    selected_item_id() {
      return (this.selected_item || {}).itemId || 0;
    },
    selected_item_name() {
      if (this.item_all_allowable && _.isNil(this.selected_item)) {
        return "全部";
      }

      return (this.selected_item || {}).name || "";
    },
    selected_item_icontag() {
      return (this.selected_item || {}).iconTag || "";
    },
    area_map() {
      return _.groupBy(this.area_list, "parentId");
    },
    area_list_top() {
      return this.area_map[-1] || [];
    },
    area_list_child() {
      return this.area_map[this.selected_top_area_id || 0] || [];
    },
    type_child_ids() {
      return _.map(this.type_child_list || [], (v) => v.typeId);
    },
    type_map() {
      return _.keyBy([...this.type_list, ...this.type_child_list], "typeId");
    },
    item_patched_list() {
      const item_list = _.flatMap(this.item_full_list, (item) => {
        const area_id = _.toNumber(item.areaId) || 0;
        const type_id_list = item.typeIdList || [];

        return _.map(type_id_list, (type_id) => {
          const item_key = `${area_id}-${type_id}`;
          const row = _.cloneDeep(item);

          row.itemKey = item_key;
          row.typeId = type_id;
          return row;
        });
      });
      return item_list;
    },
    item_map() {
      return _.groupBy(this.item_patched_list, "itemKey");
    },
    item_list() {
      const item_key = `${this.selected_area_id}-${this.selected_type_id}`;
      const item_list = _.get(this.item_map, item_key, []);
      return item_list;
    },
    item_ids() {
      return _.map(this.item_list || [], (v) => v.itemId);
    },
    item_all_allowable() {
      const pid = (this.selected_type || {}).parentId;
      return pid && pid !== -1;
    },
    item_icontags() {
      return _.chain(this.item_list || [])
        .map((v) => v.iconTag)
        .filter((v) => v)
        .value();
    },
    stepper_collapse_icon() {
      return selectorCollapse.value
        ? "keyboard_double_arrow_down"
        : "keyboard_double_arrow_up";
    },
    stepper_collapse_text() {
      return selectorCollapse.value ? "展开" : "收起";
    },
  },
  methods: {
    // 清除子分类和物品选择
    clearlist() {
      this.callback_list = {};
      this.layer_list = null;
      this.selected_item = null;
      this.handle_layer_list_data = [];
    },
    // 清理点位
    clearlayers() {
      map.value?.removeLayer(this.handle_layergroup);
      this.handle_layergroup.clearLayers();
    },
    // 切换地区
    switch_area(area) {
      if (area.isFinal) {
        this.selected_type = null;
        this.clearlist();
        this.clearlayers();
        this.selected_area = area;
        this.$emit("map_switch", this.selected_area);
        this.fetch_item_list();
        selectorJumpTo(2);
      } else {
        this.selected_top_area_id = area.areaId || 0;
      }
    },
    test_area_select(area) {
      if (area.isFinal) {
        return area.areaId === this.selected_area_id;
      }

      return area.areaId === this.selected_top_area_id;
    },
    // 如果有子分类的话，进行查询，生成子分类tabs
    select_type_list(value) {
      this.clearlist();
      this.clearlayers();
      this.selected_type = value;
      selectorJumpTo(3);
      if (this.item_all_allowable) {
        this.fetch_item_layers(null);
      }
    },
    fetch_item_list() {
      this.loading = true;
      query_itemlist({
        areaIdList: [this.selected_area_id],
        current: 0,
        size: 9999,
      }).then((res) => {
        this.loading = false;
        const data = res.data.data.record || [];
        this.item_full_list = data;
      });
    },
    // 查询点位信息
    fetch_item_layers(value) {
      this.clearlayers();
      this.loading = true;
      this.selected_item = value;

      const item_ids =
        this.item_all_allowable && this.selected_item_id <= 0
          ? this.item_ids
          : [this.selected_item_id];

      const item_getter =
        item_ids.length > 0
          ? query_itemlayer_infolist({
              typeIdList: [],
              areaIdList: [],
              itemIdList: item_ids,
              getBeta: 0,
            })
          : Promise.resolve({ data: { data: [] } });

      // 查询点位图标和点位数据
      this.$axios.all([item_getter]).then(
        this.$axios.spread((layerlist) => {
          const layer_records = layerlist.data.data || [];
          const layer_record_list = _.map(layer_records, (v) => {
            const itemIdsData = _.map(v.itemList || [], "itemId");
            const itemIdsSel = item_ids || [];
            const itemIdIcon = _.first(_.intersection(itemIdsData, itemIdsSel));
            const iconUrl = this.get_icon_url_by_id(itemIdIcon);
            v.icon = { url: iconUrl };
            return v;
          });

          this.handle_layer_list_data = layer_record_list;
          this.paint_layers(this.handle_layer_list_data);
          this.loading = false;
        })
      );
    },
    // 查询点位并渲染至地图上
    paint_layers(value) {
      for (const i of value) {
        this.handle_layergroup.addLayer(
          layer_register(i, _.isNil(i.icon.url) ? "" : i.icon.url)
        );
      }

      this.layer_eventbind();
      map.value?.addLayer(this.handle_layergroup);
    },
    // 为点位绑定事件
    layer_eventbind() {
      // 为点位绑定弹窗事件和拖动事件
      this.handle_layergroup.eachLayer((layer) => {
        const layerid = layer.options.data.id;
        const marklist = JSON.parse(localStorage.getItem("marked_layers"));
        if (marklist.findIndex((item) => item === layerid) !== -1) {
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
    // 解绑未选中点位的拖动
    unbinddrag(draglayer) {
      this.handle_layergroup.eachLayer((layer) => {
        if (layer.options.data.id !== draglayer.target.options.data.id) {
          layer.dragging.disable();
        }
      });
    },
    // 标记点位
    mark_layer(layer) {
      const marklayer = this.handle_layergroup.getLayer(
        layer.target._leaflet_id
      );
      layer_mark(marklayer);
      const layerid = layer.target.options.data.id;
      const arr = JSON.parse(localStorage.getItem("marked_layers"));
      const index = arr.findIndex((item) => item === layerid);
      if (index === -1) {
        arr.push(layerid);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      } else {
        arr.splice(index, 1);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      }
    },
    // 聚焦点位
    focus_layer(data, zoom = 1) {
      const location = data.position.split(",");
      map.value?.flyTo(location, zoom);
      const list = this.handle_layergroup.getLayers();
      for (const i of list) {
        if (i.options.data.id === data.id) {
          if (i.isPopupOpen() !== true) {
            i.openPopup();
          }
        }
      }
    },
    // 刷新当前点位组
    refresh_layers() {
      this.clearlayers();
      this.paint_layers(this.handle_layer_list_data);
    },
    // 添加模式
    add_mode_on() {
      this.add_mode = true;
      this.loading = true;
      map.value?.on("click", (event) => {
        const marker = L.marker([event.latlng.lat, event.latlng.lng], {
          icon: L.icon(create_icon_options("")),
        });
        this.handle_layergroup.addLayer(marker);
        this.new_layer_id = marker._leaflet_id;
        this.edit_mode(1, undefined, `${event.latlng.lat},${event.latlng.lng}`);
      });
    },
    // 添加模式
    add_mode_off() {
      this.add_mode = false;
      this.loading = false;
      map.value?.off("click");
      if (this.new_layer_id !== 0) {
        this.handle_layergroup.removeLayer(this.new_layer_id);
        this.new_layer_id = 0;
      }
    },
    // 编辑弹窗的模式函数
    edit_mode(type, data, position) {
      this.handle_type = type;
      this.edit_data = {
        type,
        data,
        list: {
          area: this.selected_area,
          type: this.selected_type,
          item: this.selected_item,
          item_child: this.item_all_allowable ? this.type_child_list : [],
        },
        position,
      };
      layer_edit_window.value = true;
    },
    // 表格操作的回调函数
    table_callback(callback) {
      switch (callback.type) {
        case 1:
          this.add_mode_on(true);
          // This.edit_mode(1, callback.data);
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
        case 6:
          this.refresh();
          break;
      }
    },
    get_icon_url_by_tag(icontag = "") {
      return _.get(
        this.icon_map,
        [icontag, "url"],
        "https://assets.yuanshen.site/icons/-1.png"
      );
    },
    get_icon_url_by_id(id = 0) {
      const item_found = _.find(this.item_list, (v) => v.itemId === id);
      const icon_tag = _.get(item_found, "iconTag", "");
      return this.get_icon_url_by_tag(icon_tag);
    },
    // 点位弹窗回调
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
    // 完成后，刷新当前点位
    refresh() {
      this.add_mode_off();
      layer_edit_window.value = false;
      this.fetch_item_layers(this.selected_item);
    },
    // 删除点位
    delete_layer(data) {
      if (confirm("你确定要删除这个点位么，该操作不可撤销") === true) {
        delete_layer(data.id).then((res) => {
          create_notify(res.data.message);
          this.refresh();
        });
      }
    },
    // 提交点位位置改动
    upload_position() {
      let position = this.handle_layer.target._latlng;
      position = `${position.lat},${position.lng}`;
      edit_layer({
        position,
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
    // 注册点位组
    this.handle_layergroup = layergroup_register();
    // 查询地区和分类
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
        query_itemlayer_icon({
          size: 9999,
          current: 0,
        }),
      ])
      .then(
        this.$axios.spread((arealist, typelist, iconlist) => {
          this.loading = false;
          this.area_list = arealist.data.data || [];
          this.type_list = typelist.data.data.record;
          this.icon_map = _.keyBy(iconlist.data.data.record || [], "tag");
        })
      )
      .then(() => {
        const type_not_final = _.find(this.type_list, (v) => !v.isFinal);
        if (type_not_final) {
          return query_itemtype(1, {
            current: 1,
            typeIdList: [type_not_final.typeId],
            size: 999,
          }).then((res) => {
            this.loading = false;
            this.type_child_list = res.data.data.record;
          });
        }
      });
    // 快捷键
    document.onkeyup = (event) => {
      switch (event.keyCode) {
        // D键，直接拖拽
        case 68:
          if (this.handle_layergroup.getLayers().length === 0) {
            alert("未选择物品，请先选择物品");
          } else if (this.dragmode === false) {
            this.handle_layergroup.eachLayer((layer) => {
              layer.dragging.enable();
            });
          }

          break;
        // `键，新增模式
        case 192:
          if (this.handle_layergroup.getLayers().length === 0) {
            alert("未选择物品，请先选择物品");
          } else if (this.add_mode === false) {
            this.add_mode_on();
          }

          break;
      }
    };
  },
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
:deep(.stepper-header) {
  flex-wrap: nowrap !important;
}
.item-entry {
  line-height: 2.5rem;
  border-radius: 1.2rem;
  padding-left: 0.4rem;
  &.active,
  &:hover {
    background-color: #e3eefa;
  }
}
.marker-action-container {
  display: flex;
  flex-direction: column;
  .marker-action-step {
    position: relative;
    min-height: 20vh;
    max-height: 30vh;
  }
  .marker-action-toggle {
    display: flex;
    flex-direction: row;
    .text {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
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
