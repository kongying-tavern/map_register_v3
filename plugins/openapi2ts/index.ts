import { join } from 'path'
import { readFile, readdir, writeFile } from 'fs/promises'
import type { Plugin } from 'vite'
import { generateService } from 'openapi2ts'
import type { GenerateServiceProps } from 'openapi2ts'

export interface Openapi2tsOptions extends GenerateServiceProps {
  /** openAPI 3.0 的地址 */
  schemaPath: string
  /** 自定义请求方法路径 */
  requestLibPath?: string
  /** 自定义请求方法表达式，优先级高于 `requestLibPath` */
  requestImportStatement?: string
}

/**
 * 自动更新接口类型的钩子
 */
export const openapi2ts = (optionList: Openapi2tsOptions[], initFlag = false): Plugin => {
  const plugin: Plugin = {
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
