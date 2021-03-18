import type { Node } from 'unist'
import visit from 'unist-util-visit'
import type { IElmNode, IUnifiedTransformer } from '.'

export default function isolation(): IUnifiedTransformer {
	return (ast: Node) => {
		visit<IElmNode>(ast, 'root', (node) => {
			if (node.children) {
				node.children = node.children.reduce((result, item) => {
					// push wrapper element when first loop or the prev node is previewer node
					if (!result.length || result[result.length - 1].previewer) {
						result.push({
							type: 'element',
							tagName: 'div',
							properties: { className: 'markdown' },
							children: [],
						})
					}

					if (item.previewer) {
						// push item directly if it is previewer node
						result.push(item)
					} else {
						// push item into wrapper element if it is not previewer node
						result[result.length - 1].children?.push(item)
					}

					return result
				}, [] as IElmNode[])
			}
		})
	}
}
