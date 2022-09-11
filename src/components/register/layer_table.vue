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
    >
      <!-- 表格头插槽 -->
      <template #top-left>
        <div class="q-table__title">
          点位
          <div
            class="inline-block"
            style="margin-left: 20px;">
            <q-input
              v-model="filter_text"
              dense
              outlined
              rounded
              debounce="300"
              color="primary">
              <template #prepend>
                <q-icon name="search" />
              </template>
              <template #append>
                <q-icon
                  class="cursor-pointer"
                  name="close"
                  @click="clearFilter" />
                <q-icon
                  class="cursor-pointer"
                  name="info"
                  tag="div">
                  <q-tooltip
                    anchor="bottom middle"
                    self="top middle">
                    <q-markup-table
                      dark
                      dense
                      separator="none"
                      flat
                      style="background: none"
                    >
                      <thead>
                        <tr>
                          <th class="text-center">搜索内容</th>
                          <th class="text-center">功能</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="text-center">#ID</td>
                          <td class="text-center">定位ID</td>
                        </tr>
                        <tr>
                          <td class="text-center">!内容</td>
                          <td class="text-center">反向搜索标题/描述</td>
                        </tr>
                        <tr>
                          <td class="text-center">内容</td>
                          <td class="text-center">搜索标题/描述</td>
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
              self="top middle">
              未选择具体分类，无法操作
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
      <template #header-cell-content="props">
        <q-th class="text-left">
          描述
          <q-icon
            style="padding-left: 10px;"
            class="cursor-pointer text-blue-7"
            :name="table_content_full_icon"
            size="sm"
            @click="() => { table_content_full = !table_content_full; }">
            <q-tooltip
              anchor="bottom right"
              self="bottom left">
              显示/隐藏完整描述
            </q-tooltip>
          </q-icon>
        </q-th>
      </template>
      <template #body-cell-content="props">
        <q-td class="text-left">
          <div :class="table_content_full_class">
            {{ props.row.content }}
            <q-tooltip v-if="!table_content_full && props.row.content.length > 10">
              <div class="tooltip_text text_nl">{{ props.row.content }}</div>
            </q-tooltip>
          </div>
        </q-td>
      </template>
      <!-- 编辑插槽 -->
      <template #header-cell-handle="props">
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
            @click="callback(2, props.row)">
            <q-tooltip
              anchor="top middle"
              self="top middle">
              定位
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="edit"
            color="yellow-9"
            dense
            round
            glossy
            @click="callback(3, props.row)">
            <q-tooltip
              anchor="top middle"
              self="top middle">
              编辑
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="delete"
            color="red-6"
            dense
            round
            glossy
            @click="callback(4, props.row)">
            <q-tooltip
              anchor="top middle"
              self="top middle">
              删除
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: "LayerTable",
  props: ["propdata", "propitem"],
  data() {
    return {
      filter_text: '',
      table_content_full: false,

      icon_data: {},

      layer_data: [],
      layer_columns: [
        {
          name: "id",
          align: "center",
          label: "点位ID",
          field: "id",
          align: "left",
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
          align: "center",
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
        type: type,
        data: data,
      });
    },
    clearFilter() {
      this.filter_text = ''
    },
    applyFilter(rows, terms, cols, getCellValue) {
      if(!this.formdata || this.formdata.length <= 0) {
        return [];
      } else if(!terms) {
        return this.formdata;
      }

      let list = [];
      let termsStr = terms || '';
      // ID
      if(_.startsWith(termsStr, '#')) {
        let markerIdStr = termsStr.replace(/^#/gui, '');
        list = _.filter(this.formdata, v => v.id && v.id.toString() === markerIdStr);
      } else if(_.startsWith(termsStr, '!')) {
        let filterStr = termsStr.replace(/^!/gui, '');
        list = _.filter(this.formdata, v => {
          let markerTitle = v.markerTitle || '';
          let markerContent = v.content || '';
          return markerTitle.indexOf(filterStr) === -1 && markerContent.indexOf(filterStr) === -1;
        });
      } else {
        list = _.filter(this.formdata, v => {
          let markerTitle = v.markerTitle || '';
          let markerContent = v.content || '';
          return markerTitle.indexOf(termsStr) !== -1 || markerContent.indexOf(termsStr) !== -1;
        });
      }

      return list;
    }
  },
  computed: {
    formdata() {
      this.layer_data = [...this.propdata];
      return this.layer_data;
    },
    table_content_full_class() {
      return this.table_content_full ? 'text_nl long_text text-wrap' : 'short_text ellipsis';
    },
    table_content_full_icon() {
      return this.table_content_full ? 'blur_on' : 'blur_off';
    }
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
