/**
 * 扁平化接口类型节点
 * @param {import('../types').ApiTree[]} tree
 * @param {import('../types').ApiTree[]} seed
 * @returns {import('../types').ApiTree[]}
 */
const flatFilterApi = (tree, seed = []) => {
  return tree.reduce((nodes, node) => {
    if (node.type === 'apiDetail') nodes.push(node)
    if (node.children) flatFilterApi(node.children, nodes)
    return nodes
  }, seed)
}

module.exports = flatFilterApi
