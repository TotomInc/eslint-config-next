<script>
export default {
  props: ["label"],
  data() {
    return { count: 0 };
  },
};
</script>

<template>
  <button @click="$emit('increment')" class="px-4 rounded-sm">{{ label }}</button>
  <br>
</template>
