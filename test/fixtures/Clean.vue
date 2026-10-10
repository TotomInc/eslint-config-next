<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ label: string }>();

const emit = defineEmits<{ increment: [count: number] }>();

const count = ref<number>(0);

function increment() {
  count.value += 1;
  emit("increment", count.value);
}
</script>

<template>
  <button class="rounded-sm px-4 py-2" type="button" @click="increment">
    {{ props.label }}: {{ count }}
  </button>
  <br />
</template>
