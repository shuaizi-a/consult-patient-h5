<template>
  <CpIcon />
</template>

<script setup lang="tsx">
  // 提供name属性即可
  const props = defineProps<{
    name: string;
  }>();

  const CpIcon = () => {
    return (
      <svg aria-hidden="true" class="cp-icon">
        <use href={`#icon-${props.name}`} />
      </svg>
    );
  };
</script>

<style lang="scss">
  .cp-icon {
    // 和字体一样大
    width: 1em;
    height: 1em;
  }
</style>
