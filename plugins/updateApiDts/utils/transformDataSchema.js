const deApifoxRefs = require('./deApifoxRefs')

/**
 * 将 apifox 的数据模型转换为标准 JSONSchema 定义，
 * 并且尽可能的解除自定义引用 `x-apifox-refs`
 * @param {import('../types').DataSchema[]} dataSchema
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

  deApifoxRefs(schema, {
    onNodeStart: (nodeSchema, keyIndex) => {
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
    },
  })

  return schema
}

module.exports = transformDataSchema
