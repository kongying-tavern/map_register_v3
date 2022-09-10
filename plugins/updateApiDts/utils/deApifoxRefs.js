const traverse = require('json-schema-traverse')

/**
 * 将 apifox 自定义引用转化为标准引用
 * @param {import('../types').ApifoxJSONSchema} apifoxSchema
 * @param {{
 *   onNodeStart?: (schema: import('../types').ApifoxJSONSchema, key: string) => void
 *   redundantKeys?: string[]
 * }} options
 * @returns {import('jsonschema').Schema}
 */
const deApifoxRefs = (apifoxSchema, options = {}) => {
  const {
    onNodeStart,
    redundantKeys = ['x-apifox-refs', 'x-apifox-orders', 'x-apifox-overrides'],
  } = options

  const clearRedundantKeys = (obj) => {
    redundantKeys.forEach((key) => {
      delete obj[key]
    })
  }

  /** @type {import('json-schema-traverse').Callback} */
  const post = (...{ 0: nodeSchema, 6: keyIndex }) => {
    onNodeStart?.(nodeSchema, keyIndex)

    // ==================== 解引用 ====================
    /** @type {Record<string, { $ref: string; ['x-apifox-overrides']: Record<string, any> }> | undefined | null} */
    const apifoxRefs = nodeSchema['x-apifox-refs']

    // 清理多余属性
    clearRedundantKeys(nodeSchema)

    // 判断当前节点是否存在自定义引用
    if (!apifoxRefs) return

    const apifoxRefValues = Object.values(apifoxRefs)
    if (!apifoxRefValues.length) return

    const allOf = apifoxRefValues.map(({ $ref }) => ({ $ref }))

    switch (nodeSchema.type) {
      case 'object':
        Object.keys(nodeSchema.properties ?? {}).length &&
          allOf.push({
            type: 'object',
            properties: nodeSchema.properties,
          })
        nodeSchema.allOf = allOf
        delete nodeSchema.properties
        break
      case 'array':
        Object.keys(nodeSchema.items.properties ?? {}).length &&
          allOf.push({
            type: 'object',
            properties: nodeSchema.items.properties,
          })
        nodeSchema.items = {
          ...nodeSchema.items,
          allOf,
        }
        delete nodeSchema.items.properties
        break
      default:
      // no action
    }
  }

  traverse(apifoxSchema, { cb: { post } })

  return apifoxSchema
}

module.exports = deApifoxRefs
