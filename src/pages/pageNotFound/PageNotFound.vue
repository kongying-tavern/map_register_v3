<template>
  <div class="page-not-found">
    <div class="content">
      <span>4</span>
      <span>0</span>
      <span>4</span>
    </div>
    <div class="proverbs">
      前面的区域，以后再来探索吧！
    </div>
  </div>
</template>

<style scoped>
  @property --w {
    syntax: "<length>";
    initial-value: 1px;
    inherits: false;
  }

  .page-not-found {
    user-select: none;
    width: 100dvw;
    height: 100dvh;
    display: grid;
    place-items: center;
    place-content: center;
    container-type: size;
    color: #666;
    line-height: 1;
  }

  .content {
    display: flex;
    justify-content: space-between;
    font-weight: bolder;
    font-size: min(30cqw, 50cqh);
    transform-origin: 50% 50%;
    scale: 0.75;
  }

  .proverbs {
    font-size: min(3cqw, 5cqh);
    translate: 0 calc(0cqw - min(4.5cqw, 7.5cqh));
  }
</style>
