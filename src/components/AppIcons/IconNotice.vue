<script setup lang="ts">
/** star radius large outer */
const srlo = 0.32145
/** star offset large inner */
const sroi = [0.7348, 7.6223]

const scale = 0.5

/** star radius small outer */
const srso = srlo * scale
/** star offset small inner */
const srsi = [sroi[0] * scale, sroi[1] * scale]
</script>

<template>
  <svg viewBox="0 0 64 64" fill="currentColor">
    <path d="M 32 2.7574 L 34.1213 4.8787 L 32 7 L 29.8787 4.8787 Z" />
    <path d="M 30.9393 6.6464 L 31.2929 7 L 21.2929 17 L 20.5858 17 Z" />
    <path d="M 33.0607 6.6464 L 43.4142 17 L 42.7071 17 L 32.7071 7 Z" />
    <path d="M 4.2872 16 l 2 0 l 0 2 l -2 0 Z" />
    <path d="M 57.7128 16 l 2 0 l 0 2 l -2 0 Z" />
    <path d="M 4.2872 46 l 2 0 l 0 2 l -2 0 Z" />
    <path d="M 57.7128 46 l 2 0 l 0 2 l -2 0 Z" />
    <path
      d="
        M 6.7872 17 l 50.4256 0 l 0 1.5 l 1.5 0 l 0 27 l -1.5 0 l 0 1.5 l -50.4256 0 l 0 -1.5 l -1.5 0 l 0 -27 l 1.5 0 z
        M 8.7872 18.5 q 0 2 -2 2 l 0 23 q 2 0 2 2 l 46.4256 0 q 0 -2 2 -2 l 0 -23 q -2 0 -2 -2 l -46.4256 0 z
      "
    />
    <path
      :d="`
        M 9.0233 18.75 l 45.9535 0 q 0 1.9861 1.9861 1.9861 l 0 22.5279 q -1.9861 0 -1.9861 1.9861 l -45.9535 0 q 0 -1.9861 -1.9861 -1.9861 l 0 -22.5279 q 1.9861 0 1.9861 -1.9861 z

        M 26.3848 22.3848
        q -${srlo} -${srlo} -${2 * srlo} 0
        q -${sroi[0]} ${sroi[1]} -${sroi[0] + sroi[1]} ${sroi[0] + sroi[1]}

        q -${srlo} ${srlo} 0 ${2 * srlo}
        q ${sroi[1]} ${sroi[0]} ${sroi[0] + sroi[1]} ${sroi[0] + sroi[1]}

        q ${srlo} ${srlo} ${2 * srlo} 0
        q ${sroi[0]} -${sroi[1]} ${sroi[0] + sroi[1]} -${sroi[0] + sroi[1]}

        q ${srlo} -${srlo} 0 -${2 * srlo}
        q -${sroi[1]} -${sroi[0]} -${sroi[0] + sroi[1]} -${sroi[0] + sroi[1]}
        z

        M 40.1429 35.1429
        q -${srso} -${srso} -${2 * srso} 0
        q -${srsi[0]} ${srsi[1]} -${srsi[0] + srsi[1]} ${srsi[0] + srsi[1]}

        q -${srso} ${srso} 0 ${2 * srso}
        q ${srsi[1]} ${srsi[0]} ${srsi[0] + srsi[1]} ${srsi[0] + srsi[1]}

        q ${srso} ${srso} ${2 * srso} 0
        q ${srsi[0]} -${srsi[1]} ${srsi[0] + srsi[1]} -${srsi[0] + srsi[1]}

        q ${srso} -${srso} 0 -${2 * srso}
        q -${srsi[1]} -${srsi[0]} -${srsi[0] + srsi[1]} -${srsi[0] + srsi[1]}
        z
      `"
    />
  </svg>
</template>
