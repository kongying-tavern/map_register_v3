<template>
  <div
    class="
      app-loading
      w-full h-full grid place-content-center
      bg-[#25313F]
      text-[#ECE5D8]
    "
  >
    <div class="text-2xl font-bold">
      正在加载
    </div>
    <div>前面的区域，马上就能探索~</div>
  </div>
</template>

<style scoped>
@keyframes app-init {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.app-loading {
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
  place-content: center;
  color: #ECE5D8;
  background-color: #25313F;
  &::before {
    content: '';
    position: absolute;
    box-sizing: border-box;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 4px solid #ECE5D8F0;
    clip-path: xywh(0 0 50% 50%);
    width: 256px;
    height: 256px;
    border-radius: 128px;
    animation: app-init linear 2s infinite;
  }
  &::after {
    content: '';
    position: absolute;
    box-sizing: border-box;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px dashed #ECE5D860;
    width: 254px;
    height: 254px;
    border-radius: 128px;
  }
}
</style>
