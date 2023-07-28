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
        :caption="`当前选择：${selectorAreaName}`"
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
            <template v-for="(i, idx) in selectorAreaListTop" :key="idx">
              <q-separator v-if="idx > 0"></q-separator>
              <q-item
                clickable
                :active="selectorAreaTestSelect(i)"
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
            v-if="selectorAreaListChild.length > 0"
            style="flex: 5; overflow-y: auto"
            dense
          >
            <template v-for="(i, idx) in selectorAreaListChild" :key="idx">
              <q-separator v-if="idx > 0"></q-separator>
              <q-item
                clickable
                :active="selectorAreaTestSelect(i)"
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
        :caption="`当前选择：${selectorTypeName}`"
        icon="bookmarks"
        active-icon="bookmarks"
        :active-color="selectorCollapse ? 'blue-10' : 'primary'"
        done-icon="bookmarks"
        :done-color="selectorCollapse ? 'blue-10' : 'primary'"
        :done="selectorCollapse || selectorStep === 2"
        :header-nav="!selectorCollapse"
      >
        <div v-if="selectorAreaId <= 0">
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
            <template v-for="(i, idx) in selectorTypeList" :key="idx">
              <q-btn
                v-if="i.isFinal"
                :color="selectorTypeId === i.typeId ? 'primary' : 'white'"
                :text-color="selectorTypeId === i.typeId ? 'white' : 'black'"
                @click="select_type_list(i)"
              >
                <q-item-section>{{ i.name }}</q-item-section>
              </q-btn>
              <q-btn-dropdown
                v-else
                :label="i.name"
                :color="
                  selectorTypeChildIds.indexOf(selectorTypeId) !== -1
                    ? 'primary'
                    : 'white'
                "
                :text-color="
                  selectorTypeChildIds.indexOf(selectorTypeId) !== -1
                    ? 'white'
                    : 'black'
                "
                dropdown-icon="change_history"
              >
                <q-list>
                  <q-item
                    v-for="(j, idxChild) in selectorTypeChildList"
                    :key="idxChild"
                    :class="
                      [
                        j.typeId === selectorTypeId ? 'bg-blue' : 'bg-white',
                        j.typeId === selectorTypeId
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
        :caption="`当前选择：${selectorItemName}`"
        icon="pets"
        active-icon="pets"
        :active-color="selectorCollapse ? 'blue-10' : 'primary'"
        done-icon="pets"
        :done-color="selectorCollapse ? 'blue-10' : 'primary'"
        :done="selectorCollapse || selectorStep === 3"
        :header-nav="!selectorCollapse"
      >
        <div v-if="selectorAreaId <= 0">
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
        <div v-else-if="selectorTypeId <= 0">
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
              v-if="selectorItemAllAllowable"
              class="col-4 cursor-pointer item-entry"
              @click="
                () => {
                  selectorItem = null;
                  fetch_item_layers(null);
                }
              "
            >
              <q-radio
                v-model="selectorItem"
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
              v-for="(i, idx) in selectorItemList"
              :key="idx"
              class="col-4 cursor-pointer item-entry"
              :class="{ active: selectorItemId === i.itemId }"
              @click="
                () => {
                  selectorItem = i;
                  fetch_item_layers(i);
                }
              "
            >
              <q-radio
                v-model="selectorItem"
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
              <q-icon :name="selectorStepperCollapseIcon" right></q-icon>
              {{ selectorStepperCollapseText }}
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
      :propitem="selectorItem"
      :itemlist="selectorItemFullList"
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
        :basic-types="selectorTypeMap"
        :basic-icon="selectorIconMap"
        :basic-items="selectorItemPatchedList"
        :sel-area="selectorArea"
        :sel-type="selectorType"
        :sel-item="selectorItem"
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
import { map, mapDom } from "src/pages/map";
import {
  selectorCollapse,
  selectorStepperCollapseIcon,
  selectorStepperCollapseText,
  selectorStep,
  selectorToggle,
  selectorJumpPrev,
  selectorJumpNext,
  selectorJumpTo,
  selectorIconMap,
  selectorAreaTopId,
  selectorArea,
  selectorAreaList,
  selectorAreaId,
  selectorAreaName,
  selectorAreaListTop,
  selectorAreaListChild,
  selectorAreaTestSelect,
  selectorType,
  selectorTypeList,
  selectorTypeChildList,
  selectorTypeId,
  selectorTypeName,
  selectorTypeChildIds,
  selectorTypeMap,
  selectorItem,
  selectorItemFullList,
  selectorItemId,
  selectorItemName,
  selectorItemPatchedList,
  selectorItemList,
  selectorItemIds,
  selectorItemAllAllowable,
} from "./selector-data";
import FilterCard from "src/components/filters/filter-card.vue";
import FilterShare from "src/components/filters/filter-share.vue";
import { layer_edit_window } from "src/components/dialogs/layer_edit_window";
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
  setup() {
    return {
      map,

      layer_edit_window,

      selectorCollapse,
      selectorStepperCollapseIcon,
      selectorStepperCollapseText,
      selectorStep,
      selectorToggle,
      selectorJumpPrev,
      selectorJumpNext,
      selectorJumpTo,
      selectorIconMap,
      selectorAreaTopId,
      selectorArea,
      selectorAreaList,
      selectorAreaId,
      selectorAreaName,
      selectorAreaListTop,
      selectorAreaListChild,
      selectorAreaTestSelect,
      selectorType,
      selectorTypeList,
      selectorTypeChildList,
      selectorTypeId,
      selectorTypeName,
      selectorTypeChildIds,
      selectorTypeMap,
      selectorItem,
      selectorItemFullList,
      selectorItemId,
      selectorItemName,
      selectorItemPatchedList,
      selectorItemList,
      selectorItemIds,
      selectorItemAllAllowable,
    };
  },
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
  methods: {
    // 清除子分类和物品选择
    clearlist() {
      this.callback_list = {};
      this.layer_list = null;
      selectorItem.value = null;
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
        selectorType.value = null;
        this.clearlist();
        this.clearlayers();
        selectorArea.value = area;
        this.$emit("map_switch", selectorArea.value);
        this.fetch_item_list();
        selectorJumpTo(2);
      } else {
        selectorAreaTopId.value = area.areaId || 0;
      }
    },
    // 如果有子分类的话，进行查询，生成子分类tabs
    select_type_list(value) {
      this.clearlist();
      this.clearlayers();
      selectorType.value = value;
      selectorJumpTo(3);
      if (selectorItemAllAllowable.value) {
        this.fetch_item_layers(null);
      }
    },
    fetch_item_list() {
      this.loading = true;
      query_itemlist({
        areaIdList: [selectorAreaId.value],
        current: 0,
        size: 9999,
      }).then((res) => {
        this.loading = false;
        const data = res.data.data.record || [];
        selectorItemFullList.value = data;
      });
    },
    // 查询点位信息
    fetch_item_layers(value) {
      this.clearlayers();
      this.loading = true;
      selectorItem.value = value;

      const item_ids =
        selectorItemAllAllowable.value && selectorItemId.value <= 0
          ? selectorItemIds.value
          : [selectorItemId.value];

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
      console.log("refresh_layers", this.handle_layer_list_data);
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
          area: selectorArea.value,
          type: selectorType.value,
          item: selectorItem.value,
          item_child: selectorItemAllAllowable.value
            ? selectorTypeChildList.value
            : [],
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
        selectorIconMap.value,
        [icontag, "url"],
        "https://assets.yuanshen.site/icons/-1.png"
      );
    },
    get_icon_url_by_id(id = 0) {
      const item_found = _.find(selectorItemList.value, (v) => v.itemId === id);
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
      this.fetch_item_layers(selectorItem.value);
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
          selectorAreaList.value = arealist.data.data || [];
          selectorTypeList.value = typelist.data.data.record;
          selectorIconMap.value = _.keyBy(
            iconlist.data.data.record || [],
            "tag"
          );
        })
      )
      .then(() => {
        const type_not_final = _.find(
          selectorTypeList.value,
          (v) => !v.isFinal
        );
        if (type_not_final) {
          return query_itemtype(1, {
            current: 1,
            typeIdList: [type_not_final.typeId],
            size: 999,
          }).then((res) => {
            this.loading = false;
            selectorTypeChildList.value = res.data.data.record;
          });
        }
      });
    // 快捷键
    mapDom.value.onkeyup = (event) => {
      switch (event.keyCode) {
        // D键，直接拖拽
        case 68:
          if (selectorItemId.value <= 0) {
            alert("未选择物品，请先选择物品");
          } else if (this.dragmode === false) {
            this.handle_layergroup.eachLayer((layer) => {
              layer.dragging.enable();
            });
          }

          break;
        // `键，新增模式
        case 192:
          if (selectorItemId.value <= 0) {
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
    FilterCard,
    FilterShare,
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
