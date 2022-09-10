const { writeFile } = require('fs/promises')
const { join } = require('path')
const { cloneDeep } = require('lodash')
const { compile } = require('json-schema-to-typescript')
const {
  Logger,
  flatFilterApi,
  fetchApiDetails,
  transformApiDetail,
  transformDataSchema,
} = require('./utils')
const {
  AUTH_URL,
  SUMMARIES_URL,
  DOCS_URL,
  getCommonHeaders,
} = require('./config')

let startTime

/**
 * 自动更新接口类型的钩子
 * @param {import('./types').UpdateApiDtsOptions} options
 * @returns {import('vite').Plugin}
 */
const updateApiDts = (options) => {
  const {
    id,
    password,
    saveRaw = false,
    name = 'definitions',
    tempName = 'api_dts',
    refreshInterval = 600000,
  } = options

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'update-api-dts',
    apply: 'serve',

    configResolved: async (viteConfig) => {
      const time = new Date().getTime()
      if (startTime && time - startTime < refreshInterval) return
      startTime = time
      try {
        const { root } = viteConfig
        const { outDir = join(root, 'src/api'), tempDir = join(root, 'temp') } =
          options

        // quasar 不支持顶部 ESM 导入，只能通过异步导入
        const { got } = await import('got')
        const { parse: cookieParse } = await import('tough-cookie')

        Logger.info('正在更新接口定义中...')

        /** @type {import('jsonschema').Schema} */
        const cache = {
          $schema: 'http://json-schema.org/draft-07/schema',
          type: 'object',
          title: 'ApiTypeMap',
          description: '全接口请求体的类型与响应成功的类型',
          properties: {},
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
        const headers = { ...getCommonHeaders(id), Cookie: cookies }
        const request = got.extend({ headers })

        // ==================== 获取接口概述 ====================
        const summaryUrl = `${SUMMARIES_URL}/${id}`
        Logger.info('fetch:', summaryUrl)

        /** @type {import('./types').ApifoxDocResponse<import('./types').ApifoxDocData>} */
        const { data: summires } = await request.get(summaryUrl).json()
        saveRaw && (cache['x-raw-summires'] = summires)

        // ==================== 获取数据模型 ====================
        const docsUrl = `${DOCS_URL}/${id}/data-schemas`
        Logger.info('fetch:', docsUrl)

        /** @type {import('./types').ApifoxDocResponse<import('./types').DataSchema[]>} */
        const { data: dataSchema } = await request.get(docsUrl).json()
        saveRaw && (cache['x-raw-dataSchema'] = cloneDeep(dataSchema))
        cache.definitions = transformDataSchema(dataSchema).properties

        // ==================== 获取接口树形配置 ====================
        const treeUrl = `${DOCS_URL}/${id}/http-api-tree`
        Logger.info('fetch:', treeUrl)
        /** @type {import('./types').ApifoxDocResponse<import('./types').ApiTree[]>} */
        const { data: apiTree } = await request.get(treeUrl).json()
        const apiList = flatFilterApi(apiTree)
        saveRaw && (cache['x-raw-apiList'] = apiList)

        // ==================== 获取接口详情 ====================
        const client = got.extend({
          prefixUrl: `${DOCS_URL}/${id}/http-apis`,
          headers,
        })
        Logger.info('fetch api details...')
        const details = await fetchApiDetails(client, apiList)
        const detailProperties = transformApiDetail(details)
        cache.properties = detailProperties
        saveRaw && (cache['x-raw-apiDetails'] = details)

        // ==================== 写入到本地调试文件 ====================
        const apiJson = JSON.stringify(cache, null, 2)
        await writeFile(join(tempDir, `${tempName}.json`), apiJson)

        // ==================== 生成 TS 类型文件 ====================
        const dts = await compile(cache, 'ApiDoc', {
          unreachableDefinitions: false,
          additionalProperties: false,
          style: {
            semi: false,
            singleQuote: true,
            endOfLine: 'crlf',
          },
        })
        await writeFile(join(outDir, `${name}.ts`), dts)

        Logger.info('接口信息更新成功')
      } catch (err) {
        Logger.error('无法更新接口信息')
        Logger.error(err)
      } finally {
        Logger.info(`执行完毕，CD in ${refreshInterval}s`)
      }
    },
  }
  return plugin
}

module.exports = updateApiDts
