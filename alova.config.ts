import { defineConfig } from '@alova/wormhole'

export default defineConfig({
  generator: [
    {
      input: 'http://ddns.minemc.top:13080/v3/api-docs',
      output: './src/api/alova',
    },
  ],
})
