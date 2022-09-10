/**
 * 扁平化接口类型节点
 * @param {import('../types').ApiTree[]} tree
 * @param {import('../types').ApiTree[]} seed
 * @returns {import('../types').ApiTree[]}
 */
const flatFilterApi = (tree, seed = []) => {
  return tree.reduce((nodes, node) => {
    // apifox 的 apiDetail 分类为接口定义，其余均为目录或文档定义
    if (node.type === 'apiDetail') nodes.push(node)
    if (node.children) flatFilterApi(node.children, nodes)
    return nodes
  }, seed)
}

module.exports = flatFilterApi
