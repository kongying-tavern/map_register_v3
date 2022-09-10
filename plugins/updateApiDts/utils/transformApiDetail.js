const { set, get, upperFirst, camelCase } = require('lodash')
const deApifoxRefs = require('./deApifoxRefs')

/**
 * 将字符串转换为大驼峰
 * @param {string} str
 * @returns {string}
 */
const pascalCase = (str) => upperFirst(camelCase(str))

/** 删除节点的 title 以避免其生成不需要的接口类型 */
const onNodeStart = (nodeSchema) => {
  delete nodeSchema['title']
}

/**
 * 将 apifox 的接口定义转换为标准 JSONSchema 定义，
 * 并且尽可能的解除自定义引用 `x-apifox-refs`
 * @param {import('../types').ApiDetail[]} details
 * @returns {import('../types').ApiTypeMap}
 */
const transformApiDetail = (details) => {
  /** @type {import('../types').ApiTypeMap} */
  const properties = {}

  details.forEach((detail) => {
    const {
      method,
      name,
      description,
      path,
      requestBody: rawReq,
      responses: rawRes,
    } = detail

    const request = deApifoxRefs(rawReq.jsonSchema, { onNodeStart })

    const successRes =
      rawRes.find((resDetail) => resDetail.code === 200)?.jsonSchema ?? {}
    const response = deApifoxRefs(successRes, { onNodeStart })

    set(properties, [method, 'type'], 'object')
    set(properties, [method, 'properties', path], {
      title: pascalCase(path),
      description: `${name}; ${description}`,
      type: 'object',
      properties: {
        request,
        response,
      },
      required: ['request', 'response'],
    })

    const pathRequired = new Set(get(properties, [method, 'required']) ?? [])
    pathRequired.add(path)
    set(properties, [method, 'required'], [...pathRequired])
  })

  return properties
}

module.exports = transformApiDetail
