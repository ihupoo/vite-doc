import path from 'path'
import visit from 'unist-util-visit'
import has from 'hast-util-has-property'
import is from 'hast-util-is-element'
import type { IElmNode, IUnifiedTransformer } from '.'

function isRelativeUrl(url: any) {
	return typeof url === 'string' && !/^(?:\w+:)?\/\//.test(url) && !path.isAbsolute(url)
}

/**
 * rehype plugin to handle img source from local
 */
export default function img(): IUnifiedTransformer {
	return (ast) => {
		visit<IElmNode>(ast, 'element', (node) => {
			if (is(node, 'img') && has(node, 'src')) {
				const { src } = node.properties

				if (isRelativeUrl(src)) {
					// use wrapper element to workaround for skip props escape
					// https://github.com/mapbox/jsxtreme-markdown/blob/main/packages/hast-util-to-jsx/index.js#L159
					// eslint-disable-next-line no-new-wrappers
					node.properties.src = new String(`require('${src}')`)
				}
			}
		})
	}
}
