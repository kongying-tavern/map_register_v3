import { defineConfig } from '@alova/wormhole'

export default defineConfig({
  generator: [
    {
      input: 'https://genshin-dev.momincong.com/v3/api-docs',
      output: './src/api/alova',
    },
  ],
})
