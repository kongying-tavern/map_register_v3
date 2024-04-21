<script setup>
import _ from "lodash";
import { defineProps, defineEmits } from "vue";
import { create_notify } from "src/api/common";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  input: {
    type: HTMLElement,
  },
  snippets: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["update"]);

const insertChars = (chars = "") => {
  let start = props.input?.selectionStart;
  let end = props.input?.selectionEnd;
  if (_.isNil(start) || _.isNil(end)) {
    create_notify("未记录到光标位置，请选择想要插入到的文本位置", "negative");
    return;
  }

  const charArray = props.value?.split("");
  charArray.splice(start, end - start, chars);
  start += chars.length;
  end = start;

  emits("update", { start, end, value: charArray.join("") });
};
</script>

<template>
  <q-btn-group unelevated dense outline stretch>
    <q-btn
      v-for="(snippet, index) in snippets"
      :key="index"
      size="sm"
      style="width: 1.3rem"
      bordered
      :label="snippet"
      @click="insertChars(snippet)"
    >
    </q-btn>
  </q-btn-group>
</template>
