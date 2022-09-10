/**
 * 扁平化接口类型节点
 * @param {import('../updateApiDts').ApiTree[]} tree
 * @param {import('../updateApiDts').ApiTree[]} seed
 * @returns {import('../updateApiDts').ApiTree[]}
 */
const flatFilterApi = (tree, seed = []) => {
  return tree.reduce((nodes, node) => {
    if (node.type === 'apiDetail') nodes.push(node)
    if (node.children) flatFilterApi(node.children, nodes)
    return nodes
  }, seed)
}

module.exports = flatFilterApi
