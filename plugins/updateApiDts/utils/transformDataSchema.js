const traverse = require('json-schema-traverse')
const { merge } = require('lodash')

const clearApifoxProperties = (obj) => {
  // ;['x-apifox-refs', 'x-apifox-orders', 'x-apifox-overrides'].forEach((key) => {
  //   delete obj[key]
  // })
}

/**
 * 将 apifox 的数据模型转换为标准 JSONSchema 定义，
 * 并且尽可能的解除自定义引用 `x-apifox-refs`
 * @param {import('../updateApiDts').DataSchema[]} dataSchema
 * @returns {import('json-schema-to-typescript').JSONSchema}
 */
const transformDataSchema = (dataSchema) => {
  const definitions = Object.fromEntries(
    dataSchema.map(({ id, jsonSchema, name, description }) => {
      return [
        id,
        {
          ...jsonSchema,
          description: [name, description].filter(Boolean).join('; '),
        },
      ]
    }),
  )

  const schema = {
    type: 'object',
    properties: definitions,
  }

  /** @type {import('json-schema-traverse').Callback} */
  const post = (...{ 0: nodeSchema, 6: keyIndex }) => {
    // 判断是否为顶级定义对象
    const isDefinitionNode = /^\d+$/.test(keyIndex)

    // 处理描述信息
    if (!isDefinitionNode) {
      const { title = '', description = '' } = nodeSchema
      nodeSchema.description = [title, description].filter(Boolean).join('; ')
      delete nodeSchema['title']
    } else {
      nodeSchema.title = `DTS_${keyIndex}`
    }

    // ==================== 解引用 ====================
    /** @type {Record<string, { $ref: string; ['x-apifox-overrides']: Record<string, any> }> | undefined | null} */
    const apifoxRefs = nodeSchema['x-apifox-refs']

    // 清理多余属性
    clearApifoxProperties(nodeSchema)

    // 判断当前节点是否存在自定义引用
    if (!apifoxRefs) return
    const keysLen = Object.keys(apifoxRefs).length
    if (!keysLen) return

    const allOf = Object.values(apifoxRefs).map(({ $ref }) => ({
      $ref,
    }))
    console.log('[allOf]', allOf)

    switch (nodeSchema.type) {
      case 'object':
        nodeSchema.allOf = [
          ...allOf,
          {
            type: 'object',
            properties: nodeSchema.properties,
          },
        ]
        delete nodeSchema.properties
        break
      case 'array':
        nodeSchema.items = {
          ...nodeSchema.items,
          allOf: [
            ...allOf,
            {
              type: 'object',
              properties: nodeSchema.items.properties,
            },
          ],
        }
        break
      default:
      // no action
    }

    // let initObj = {}
    // for (const key in apifoxRefs) {
    //   const refUrl = apifoxRefs[key].$ref
    //   // 如果自定义引用只有 1 个，则不需要做对象合并，直接使用 JSONSchema 标准引用
    //   if (keysLen === 1) {
    //     refUrl
    //     switch (nodeSchema.type) {
    //       case 'object':
    //         nodeSchema['$ref'] = refUrl
    //         break
    //       case 'array':
    //         nodeSchema['items'] = {
    //           ...nodeSchema['items'],
    //           $ref: refUrl,
    //         }
    //         break
    //       default:
    //       // no action
    //     }
    //     return
    //   }

    //   /** @type {string | undefined} */
    //   const id = refUrl.match(/\/\d+/)?.[0]?.slice(1)
    //   if (!id) continue
    //   const deRefSchema = definitions[id]
    //   if (!deRefSchema) continue
    //   initObj = merge(initObj, deRefSchema)
    // }

    // switch (nodeSchema.type) {
    //   case 'object':
    //     nodeSchema['properties'] = {
    //       ...nodeSchema['properties'],
    //       ...initObj.properties,
    //     }
    //     break
    //   case 'array':
    //     nodeSchema['items'] = {
    //       ...nodeSchema['items'],
    //       ...initObj,
    //     }
    //     break
    //   default:
    //   // no action
    // }
  }
  traverse(schema, { cb: { post } })

  return schema
}

module.exports = transformDataSchema
