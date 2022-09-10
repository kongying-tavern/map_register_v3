/** apifox 鉴权地址 */
const AUTH_URL = 'https://www.apifox.cn/api/v1/shared-doc-auth'
/** summaries 文档地址 */
const SUMMARIES_URL = 'https://www.apifox.cn/api/v1/shared-doc-summaries'
/** dataSchema 文档地址 */
const DOCS_URL = 'https://www.apifox.cn/api/v1/shared-docs'

/**
 * 伪装头
 * @type {import('got').Headers}
 */
const COMMON_HEADERS = {
  Accept: `*/*`,
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'zh-CN',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-cache',
  Host: 'www.apifox.cn',
  DNT: 1,
  Pragma: 'no-cache',
  'sec-ch-ua': `"Microsoft Edge";v="105", " Not;A Brand";v="99", "Chromium";v="105"`,
  'sec-ch-ua-platform': 'Windows',
  Referer:
    'https://www.apifox.cn/apidoc/shared-d2c2dae2-e260-417a-9527-c12f6f67aa17',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.27',
  'X-Client-Version': '1.4.12',
}

module.exports = {
  AUTH_URL,
  SUMMARIES_URL,
  DOCS_URL,
  COMMON_HEADERS,
}
