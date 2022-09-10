const { writeFile } = require('fs/promises')
const { resolve, join } = require('path')
const { cloneDeep } = require('lodash')
const { compile } = require('json-schema-to-typescript')
const {
  Logger,
  flatFilterApi,
  fetchApiDetails,
  transformDataSchema,
} = require('./utils')
const {
  AUTH_URL,
  SUMMARIES_URL,
  DOCS_URL,
  COMMON_HEADERS,
} = require('./config')

/**
 * 自动更新接口类型的钩子
 * @param {import('./updateApiDts').UpdateApiDtsOptions} options
 * @returns {import('vite').Plugin}
 */
const updateApiDts = (options) => {
  const { id, password } = options

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'update-api-dts',
    apply: 'serve',

    configResolved: async (viteConfig) => {
      try {
        const { root } = viteConfig
        const { got } = await import('got')
        const { parse: cookieParse } = await import('tough-cookie')
        const tempPath = resolve(root, 'temp')
        Logger.info('正在更新接口定义中...')

        const cache = {
          $schema: 'http://json-schema.org/draft-07/schema',
        }

        // ==================== 获取 cookies ====================
        Logger.info('fetch:', AUTH_URL)

        const authRes = await got.post(AUTH_URL, { json: { id, password } })
        const cookies = (authRes.headers['set-cookie'] ?? [])
          .reduce((cookieList, cookieStr) => {
            const cookie = cookieParse(cookieStr)?.cookieString()
            cookie && cookieList.push(cookie)
            return cookieList
          }, [])
          .join(';')
        /** @type {import('got').Headers} */
        const headers = { ...COMMON_HEADERS, Cookie: cookies }
        const request = got.extend({ headers })

        // ==================== 获取接口概述 ====================
        const summaryUrl = `${SUMMARIES_URL}/${id}`
        Logger.info('fetch:', summaryUrl)

        /** @type {import('./updateApiDts').ApifoxDocResponse<import('./updateApiDts').ApifoxDocData>} */
        const { data: summires } = await request.get(summaryUrl).json()
        cache['x-raw-summires'] = summires

        // ==================== 获取数据模型 ====================
        const docsUrl = `${DOCS_URL}/${id}/data-schemas`
        Logger.info('fetch:', docsUrl)

        /** @type {import('./updateApiDts').ApifoxDocResponse<import('./updateApiDts').DataSchema[]>} */
        const { data: dataSchema } = await request.get(docsUrl).json()
        // cache['x-raw-dataSchema'] = cloneDeep(dataSchema)
        cache['x-raw-dataSchema'] = dataSchema
        cache.definitions = transformDataSchema(dataSchema).properties

        // ==================== 获取接口树形配置 ====================
        const treeUrl = `${DOCS_URL}/${id}/http-api-tree`
        Logger.info('fetch:', treeUrl)
        /** @type {import('./updateApiDts').ApifoxDocResponse<import('./updateApiDts').ApiTree[]>} */
        const { data: apiTree } = await request.get(treeUrl).json()
        const apiList = flatFilterApi(apiTree)
        cache['x-raw-apiList'] = apiList

        // ==================== 获取接口详情 ====================
        const client = got.extend({
          prefixUrl: `${DOCS_URL}/${id}/http-apis`,
          headers,
        })
        Logger.info('fetch api details...')
        const details = await fetchApiDetails(client, apiList)
        cache['x-raw-apiDetails'] = details

        // ==================== 写入到本地调试文件 ====================
        const apiJson = JSON.stringify(cache, null, 2)
        await writeFile(join(tempPath, `api_docs.json`), apiJson)

        const dts = await compile(cache, 'ApiDoc', {
          unreachableDefinitions: true,
          additionalProperties: false,
          // $refOptions: {
          //   resolve: {
          //     file: {
          //       canRead: true,
          //     },
          //   },
          //   dereference: {
          //     circular: true,
          //   },
          // },
          style: {
            semi: false,
            endOfLine: 'crlf',
          },
        })
        await writeFile(join(tempPath, 'api_dts.ts'), dts)

        Logger.info('接口信息更新成功')
      } catch (err) {
        Logger.error('无法更新接口信息')
        Logger.error(err)
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 600000))
      }
    },
  }
  return plugin
}

module.exports = updateApiDts
