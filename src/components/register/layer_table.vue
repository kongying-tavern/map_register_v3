<template>
  <div>
    <q-table
      class="sticky-header absolute-full"
      title="点位表"
      row-key="id"
      :rows="formdata"
      :columns="layer_columns"
      :rows-per-page-options="[0, 10, 20, 50]"
      selection="multiple"
      v-model:selected="selected_layer_list"
      separator="vertical"
      virtual-scroll
      :virtual-scroll-item-size="40"
      :filter="filter_text"
      :filter-method="applyFilter"
      :pagination="pagination_options"
      binary-state-sort
      column-sort-order="da"
    >
      <!-- 表格头插槽 -->
      <template #top-left>
        <div class="q-table__title">
          点位
          <div class="inline-block" style="margin-left: 20px">
            <q-input
              v-model="filter_text"
              dense
              outlined
              rounded
              debounce="300"
              color="primary"
            >
              <template #prepend>
                <q-fab
                  padding="none"
                  flat
                  unelevated
                  color="primary"
                  :icon="filter_icon"
                  active-icon="camera"
                  direction="down"
                  vertical-actions-align="left"
                >
                  <q-fab-action
                    v-for="(filter_option, filter_index) in filter_options"
                    :key="filter_index"
                    padding="xs"
                    external-label
                    color="primary"
                    :icon="filter_option.icon"
                    :label="filter_option.label"
                    @click="changeFilter(filter_option)"
                  />
                </q-fab>
              </template>
              <template #append>
                <q-icon
                  class="cursor-pointer"
                  name="close"
                  @click="clearFilter"
                />
                <q-icon class="cursor-pointer" name="info" tag="div">
                  <q-tooltip anchor="bottom middle" self="top middle">
                    <q-markup-table
                      dark
                      dense
                      separator="none"
                      flat
                      style="background: none"
                    >
                      <thead>
                        <tr>
                          <td colspan="2">
                            <q-icon size="xs" name="label"></q-icon>&nbsp;
                            <span>点击搜索框前图标以切换筛选方式</span>
                          </td>
                        </tr>
                        <tr>
                          <th class="text-left">搜索标记</th>
                          <th class="text-left">功能</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(
                            filter_option, filter_index
                          ) in filter_options"
                          :key="filter_index"
                        >
                          <td>
                            <q-icon size="xs" :name="filter_option.icon">
                            </q-icon>
                          </td>
                          <td
                            v-if="filter_option.descRaw"
                            v-html="filter_option.desc"
                          ></td>
                          <td v-else>{{ filter_option.desc }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </template>
      <template #top-right>
        <div class="layer_table row">
          <q-btn
            flat
            dense
            color="primary"
            icon="mdi-help-box"
            style="margin-right: 5px"
          >
            <q-tooltip>
              <q-markup-table
                dark
                dense
                separator="none"
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
                    <td class="text-center">D</td>
                    <td class="text-center">拖拽点位</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tooltip>
          </q-btn>
          <div>
            <q-tooltip
              v-if="propitem === null"
              anchor="bottom middle"
              self="top middle"
            >
              未选择具体物品，无法操作
            </q-tooltip>
            <q-btn
              :disable="propitem === null"
              color="secondary"
              label="新增"
              icon="add"
              dense
              rounded
              glossy
              style="margin-right: 10px"
              @click="callback(1)"
            />
            <q-btn
              :disable="propitem === null"
              color="orange"
              label="刷新"
              icon="refresh"
              dense
              rounded
              glossy
              @click="callback(6)"
            />
          </div>
        </div>
      </template>
      <!-- 描述插槽 -->
      <template #header-cell-content>
        <q-th class="text-left">
          描述
          <q-icon
            style="padding-left: 10px"
            class="cursor-pointer text-blue-7"
            :name="table_content_full_icon"
            size="sm"
            @click="
              () => {
                table_content_full = !table_content_full;
              }
            "
          >
            <q-tooltip anchor="bottom right" self="bottom left">
              显示/隐藏完整描述
            </q-tooltip>
          </q-icon>
        </q-th>
      </template>
      <template #body-cell-content="props">
        <q-td class="text-left">
          <div :class="table_content_full_class">
            {{ props.row.content }}
            <q-tooltip
              v-if="!table_content_full && props.row.content.length > 10"
            >
              <div class="tooltip_text text_nl">{{ props.row.content }}</div>
            </q-tooltip>
          </div>
        </q-td>
      </template>
      <!-- 编辑插槽 -->
      <template #header-cell-handle>
        <q-th class="text-left sticky-column sticky-right">操作</q-th>
      </template>
      <template #body-cell-handle="props">
        <q-td class="text-center sticky-column sticky-right q-gutter-sm">
          <q-btn
            icon="place"
            color="blue-5"
            dense
            round
            glossy
            @click="callback(2, props.row)"
          >
            <q-tooltip anchor="top middle" self="top middle"> 定位 </q-tooltip>
          </q-btn>
          <q-btn
            icon="edit"
            color="yellow-9"
            dense
            round
            glossy
            @click="callback(3, props.row)"
          >
            <q-tooltip anchor="top middle" self="top middle"> 编辑 </q-tooltip>
          </q-btn>
          <q-btn
            icon="delete"
            color="red-6"
            dense
            round
            glossy
            @click="callback(4, props.row)"
          >
            <q-tooltip anchor="top middle" self="top middle"> 删除 </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "LayerTable",
  props: ["propdata", "propitem", "itemlist"],
  data() {
    return {
      filter_text: "",
      filter_selected: {},
      filter_options: [
        {
          tag: "#",
          icon: "mdi-pound",
          label: "ID",
          desc: "ID 筛选",
          filter(list, searchText = "") {
            return _.filter(
              list,
              (v) => parseInt(v.id, 10) === parseInt(searchText, 10)
            );
          },
        },
        {
          tag: "==",
          icon: "mdi-equal",
          label: "包含",
          desc: "名称 / 描述包含文本",
          filter(list, searchText = "") {
            return _.filter(list, (v) => {
              const titleMatch =
                (v.markerTitle || "").indexOf(searchText) !== -1;
              const contentMatch = (v.content || "").indexOf(searchText) !== -1;
              return titleMatch || contentMatch;
            });
          },
        },
        {
          tag: "!=",
          icon: "mdi-not-equal-variant",
          label: "不包含",
          desc: "名称 / 描述不包含文本",
          filter(list, searchText = "") {
            return _.filter(list, (v) => {
              const titleUnmatch =
                (v.markerTitle || "").indexOf(searchText) === -1;
              const contentUnmatch =
                (v.content || "").indexOf(searchText) === -1;
              return titleUnmatch && contentUnmatch;
            });
          },
        },
        {
          tag: ".*",
          icon: "mdi-regex",
          label: "正则",
          desc: "对标题 / 正文进行正则匹配",
          filter(list, searchText = "") {
            return _.filter(list, (v) => {
              try {
                const reExp = new RegExp(searchText, "gui");
                const titleMatch = reExp.test(v.markerTitle || "");
                const contentMatch = reExp.test(v.content || "");
                return titleMatch || contentMatch;
              } catch {
                return false;
              }
            });
          },
        },
        {
          tag: "i",
          icon: "mdi-book-information-variant",
          label: "物品名",
          desc: "对物品名称进行匹配",
          filter: (list, searchText = "") =>
            _.filter(list, (v) => {
              const itemIdList = _.chain(v.itemList)
                .map((i) => i.itemId)
                .filter((v) => v)
                .value();
              const itemList = _.chain(itemIdList)
                .map((itemId) =>
                  _.filter(
                    this.itemlist,
                    (item) => parseInt(item.itemId, 10) === parseInt(itemId, 10)
                  )
                )
                .flattenDeep()
                .filter((v) => v)
                .value();
              const itemMatchList = _.filter(
                itemList,
                (i) => (i.name || "").indexOf(searchText) !== -1
              );
              const itemMatch = itemMatchList && itemMatchList.length > 0;
              return itemMatch;
            }),
        },
        {
          tag: "i#",
          icon: "mdi-focus-field-horizontal",
          label: "物品数量",
          desc: [
            "对物品数量进行限制",
            ["<code>&lt;N</code> 小于N", "<code>&lt;=N</code> 小于等于N"].join(
              "&nbsp;&nbsp;"
            ),
            [
              "<code>&gt;N</code> 大于N",
              "<code>&gt;=N</code> 大于等于N",
              "<code>=N</code> 等于N",
            ].join("&nbsp;&nbsp;"),
          ].join("<br>"),
          descRaw: true,
          filter(list, searchText = "") {
            return _.filter(list, (v) => {
              const itemList = v.itemList || [];
              const re = /^(?<op>=|<=|>=|<|>)(?<num>\d+)$/iu;
              const reContent = (searchText || "").match(re);
              if (!reContent) {
                return false;
              }

              const reGroups = reContent.groups || {};
              const reOp = reGroups.op || "";
              const reNum = parseInt(reGroups.num, 10) || 0;

              switch (reOp) {
                case "=":
                  return itemList.length === reNum;
                case ">":
                  return itemList.length > reNum;
                case ">=":
                  return itemList.length >= reNum;
                case "<":
                  return itemList.length < reNum;
                case "<=":
                  return itemList.length <= reNum;
                default:
                  return false;
              }
            });
          },
        },
      ],

      table_content_full: false,

      icon_data: {},

      pagination_options: {
        sortBy: "id",
        descending: true,
      },

      layer_data: [],
      layer_columns: [
        {
          name: "id",
          label: "点位ID",
          field: "id",
          align: "left",
          sortable: true,
        },
        {
          name: "markerTitle",
          label: "点位名称",
          field: "markerTitle",
          align: "left",
        },
        {
          name: "content",
          label: "描述",
          field: "content",
          align: "left",
        },
        {
          name: "handle",
          label: "操作",
          field: "handle",
          align: "left",
        },
      ],
      selected_layer_list: [],
    };
  },
  methods: {
    callback(type, data) {
      this.$emit("callback", {
        type,
        data,
      });
    },
    changeFilter(opt = {}) {
      this.filter_selected = opt || {};
    },
    clearFilter() {
      this.filter_text = "";
    },
    applyFilter(rows, terms, cols, getCellValue) { // eslint-disable-line
      if (!this.formdata || this.formdata.length <= 0) {
        return [];
      }

      const list = this.formdata || [];
      if (!terms) {
        return list;
      }

      const searchText = terms || "";
      const filterAction = this.filter_selected?.filter;
      if (!_.isFunction(filterAction)) {
        return list;
      }

      const listFiltered = filterAction(list, searchText);

      return listFiltered;
    },
  },
  computed: {
    formdata() {
      this.layer_data = [...this.propdata];
      return this.layer_data;
    },
    filter_icon() {
      const opt = this.filter_selected || {};
      const opt_icon = opt.icon || "search";
      return opt_icon;
    },
    table_content_full_class() {
      return this.table_content_full
        ? "text_nl long_text text-wrap"
        : "short_text ellipsis";
    },
    table_content_full_icon() {
      return this.table_content_full ? "blur_on" : "blur_off";
    },
  },
};
</script>

<style lang="scss" scoped>
.short_text {
  width: 150px;
  margin: 0 auto;
}

.long_text {
  width: 200px;
  margin: 0 auto;
}

.tooltip_text {
  width: 200px;
}

.text_nl {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.sticky-header {
  & :deep thead tr:first-child th {
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 20;
  }
}
.sticky-column {
  background-color: #fff;
  position: sticky;
  z-index: 1;
  &.sticky-right {
    right: 0;
  }
  &.sticky-left {
    left: 0;
  }
}
</style>
