const { join } = require('path')
const { readFile, writeFile, readdir } = require('fs/promises')
const { generateService } = require('openapi2ts')

/**
 * 自动更新接口类型的钩子
 * @param {import('./types').Openapi2tsOptions[]} optionList
 * @returns {import('vite').Plugin}
 */
const openapi2ts = (optionList) => {
  let initFlag = false
  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'openapi-to-ts',
    apply: 'serve',
    configResolved: async ({ root }) => {
      if (initFlag)
        return
      for (const options of optionList) {
        const {
          serversPath = join(root, 'src'),
          projectName = 'api',
          ...args
        } = options

        await generateService({
          serversPath,
          projectName,
          ...args,
        })

        const dtsFolderPath = join(serversPath, projectName)
        const dts = await readdir(dtsFolderPath)

        for (const filename of dts) {
          const filePath = join(serversPath, projectName, filename)
          const fileContent = (await readFile(filePath)).toString()
          const writeContent = fileContent
            // 删除头部 eslint 禁用注释
            .replace('// @ts-ignore\n/* eslint-disable */\n', '')
            // 删除类型为 header 的 params 参数声明
            .replace(/(?<=(\/\/\s*header))([\s\S]+?)(?=(}|(\/\/)))/g, '\n')
          writeFile(filePath, writeContent)
        }
      }
      initFlag = true
    },
  }
  return plugin
}

module.exports = openapi2ts
