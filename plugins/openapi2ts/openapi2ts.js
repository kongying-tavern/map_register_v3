const { generateService } = require('openapi2ts')
const { join } = require('path')
const { readFile, writeFile, readdir } = require('fs/promises')

/**
 * 自动更新接口类型的钩子
 * @param {import('./types').Openapi2tsOptions} options
 * @returns {import('vite').Plugin}
 */
const openapi2ts = (options) => {
  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'openapi-to-ts',
    apply: 'serve',
    configResolved: async ({ root }) => {
      const {
        serversPath = join(root, 'src'),
        projectName = 'api',
        namespace = 'DataModal',
        ...args
      } = options

      await generateService({
        serversPath,
        projectName,
        namespace,
        ...args,
      })

      const dts = await readdir(join(serversPath, projectName))
      for (const filename of dts) {
        const filePath = join(serversPath, projectName, filename)
        const fileContent = (await readFile(filePath)).toString()
        writeFile(filePath, fileContent.replace('// @ts-ignore\n', ''))
      }
    },
  }
  return plugin
}

module.exports = openapi2ts
