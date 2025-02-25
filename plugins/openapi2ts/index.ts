/* eslint-disable no-console */
import type { GenerateServiceProps } from 'openapi2ts'
import type { Plugin } from 'vite'
import cp from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { generateService } from 'openapi2ts'

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
export const openapi2ts = (optionList: Openapi2tsOptions[]): Plugin => {
  const plugin: Plugin = {
    name: 'openapi-to-ts',
    apply: 'serve',
    configResolved: async ({ root }) => {
      for await (const options of optionList) {
        const {
          serversPath = path.join(root, 'src'),
          projectName = 'api',
          ...args
        } = options

        const isGeneratedError = await generateService({
          serversPath,
          projectName,
          ...args,
        }).catch(err => err instanceof Error ? err : new Error(`${err}`))
        if (isGeneratedError) {
          console.error('[openAPI]', isGeneratedError)
          return
        }

        const dtsFolderPath = path.join(serversPath, projectName)
        const dts = await fs.readdir(dtsFolderPath)

        await Promise.all(dts.map(async (filename) => {
          const filePath = path.join(serversPath, projectName, filename)
          const fileContent = (await fs.readFile(filePath, { encoding: 'utf8' })).toString()
          const writeContent = fileContent
            // 删除头部 eslint 禁用注释
            .replace('// @ts-ignore\n/* eslint-disable */\n', '')
            // 删除类型为 header 的 params 参数声明
            // .replace(/\s+\/\/ header([\s\S]+?)(?=(}|(\/\/)))/g, '')
            // 格式化
            // .replace(/{\/\//g, '{\n    \/\/')
            // params 上的空对象类型替换
            .replace(/params: \{\}/g, 'params: NonNullable<unknown>')
            // 尾部分号去除
            // .replace(/;(?=(\r?\n))/g, '')
            // 尾换行符使用 windows 风格
            // .replace(/\n/g, '\r\n')
            // 所有的 any 类型改为 unknown
            .replace(/(?<=[,:]\s+)any/g, 'unknown')
            // 将 options 类型指定为 AxiosRequestConfig
            .replace('import { request } from \'@/utils\'', 'import type { AxiosRequestConfig } from \'axios\'\r\nimport { request } from \'@/utils\'')
            .replace(/options\?: \{ \[key: string\]: unknown \}/g, 'options?: AxiosRequestConfig')
          await fs.writeFile(filePath, writeContent)
        }))
      }

      // run eslint, no need to await
      new Promise<string>((resolve, reject) => {
        const childProcess = cp.exec(`eslint ${path.resolve(__dirname, '../../src/api/api')} --fix`, (err, stdout) => {
          childProcess.kill()
          if (err)
            return reject(err)
          resolve(stdout)
        })
      }).catch(() => false)
    },
  }
  return plugin
}
