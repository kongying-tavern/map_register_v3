<script setup>
import { ref } from "vue";
import { create_notify } from "src/api/common";
import { useClipboard } from "v-clipboard3";
import {
  filterCardVisible,
  filterMuteTooltip,
  filterConfigShareCode,
} from "./filter-data";

const shareCode = ref("");

const restoreMode = ref(false);

const restoreModeToggle = (state = false) => {
  restoreMode.value = state;
  if (state) {
    tempStoreCode();
  } else {
    tempRestoreCode();
  }
};

const tempStoreCode = () => {
  shareCode.value = filterConfigShareCode.value;
};

const tempRestoreCode = () => {
  filterConfigShareCode.value = shareCode.value;
};

const shareCodeCopy = async () => {
  try {
    if (restoreMode.value) {
      await useClipboard(shareCode.value);
    } else {
      await useClipboard(filterConfigShareCode.value);
    }

    create_notify(
      "分享码已复制，可将分享码发送给他人以完成过滤条件分享",
      "positive"
    );
  } catch (e) { // eslint-disable-line
    create_notify("分享码复制失败，请手动复制", "negative");
  }
};
</script>

<template>
  <div v-if="filterCardVisible" class="filter-share">
    <span class="title flex-none">分享码</span>

    <!-- 文本框区域 -->
    <q-input
      v-if="!restoreMode"
      v-model="filterConfigShareCode"
      standout
      flat
      dense
      outlined
      readonly
      bg-color="grey-2"
      class="flex-auto"
    >
    </q-input>
    <q-input
      v-else
      v-model="shareCode"
      standout
      flat
      dense
      outlined
      bg-color="blue-2"
      class="flex-auto"
      @focus="(input) => input?.target?.select()"
    >
    </q-input>

    <!-- 按钮区域 -->
    <template v-if="restoreMode">
      <q-btn
        class="flex-none"
        flat
        dense
        icon="mdi-puzzle-check-outline"
        color="green-6"
        @click="restoreModeToggle(false)"
      >
        <q-tooltip
          v-if="!filterMuteTooltip"
          anchor="top middle"
          self="bottom middle"
        >
          使用分享码
        </q-tooltip>
      </q-btn>
    </template>
    <template v-else>
      <q-btn
        class="flex-none"
        flat
        dense
        icon="mdi-puzzle-edit-outline"
        color="purple-4"
        @click="restoreModeToggle(true)"
      >
        <q-tooltip
          v-if="!filterMuteTooltip"
          anchor="top middle"
          self="bottom middle"
        >
          修改分享码
        </q-tooltip>
      </q-btn>
      <q-btn
        class="flex-none"
        flat
        dense
        icon="mdi-share-variant-outline"
        color="blue-7"
        @click="shareCodeCopy"
      >
        <q-tooltip
          v-if="!filterMuteTooltip"
          anchor="top middle"
          self="bottom middle"
        >
          分享
        </q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.filter-share {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.3rem 0;
}

.flex-none {
  flex: none;
}

.flex-auto {
  flex: auto;
}
</style>
