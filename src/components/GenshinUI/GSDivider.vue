<template>
  <div class="gs-divider" v-bind="$attrs" />
</template>

<style lang="scss" scoped>
.gs-divider {
  --arrow-size: 8px;
  width: 100%;
  height: 48px;
  position: relative;
  &::before {
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    background: linear-gradient(
      to bottom,
      transparent,
      transparent calc(50% - 1px),
      #E2DACE calc(50% - 1px),
      #E2DACE calc(50% + 1px),
      transparent calc(50% + 1px),
      transparent,
    );
    mask-image: linear-gradient(
      to right,
      #000,
      #000 calc(50% - var(--arrow-size)),
      transparent calc(50% - var(--arrow-size)),
      transparent calc(50% + var(--arrow-size)),
      #000 calc(50% + var(--arrow-size)),
      #000,
    );
  }
  &::after {
    content: '';
    position: absolute;
    width: var(--arrow-size);
    height: var(--arrow-size);
    border: 3px solid #E2DACE;
    left: calc(50% - calc(var(--arrow-size) / 2));
    top: calc(50% - calc(var(--arrow-size) / 2));
    outline: 2px solid #E2DACE;
    outline-offset: 2px;
    rotate: 135deg;
    clip-path: polygon(-100% -100%, 200% -100%, 200% 200%);
    translate: 0 -1px;
  }
}
</style>
