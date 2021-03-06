import path from 'path'
import type { Node } from 'unist'
import deepmerge from 'deepmerge'
import is from 'hast-util-is-element'
import has from 'hast-util-has-property'
import visit from 'unist-util-visit'
import { parseElmAttrToProps } from '../utils'
import parser from './parser'
import { listenFileOnceChange } from '../utils'
import type { IUnifiedTransformer, IElmNode } from '../index'

/**
 * serialize api node to [title, node, title, node, ...]
 * @param node        original api node
 * @param identifier  api parse identifier, mapping in .umi/dumi/apis.json
 * @param definitions api definitions
 */
function serializeAPINodes(node: IElmNode, identifier: string, definitions: ReturnType<typeof parser>) {
	const parsedAttrs = parseElmAttrToProps(node.properties)
	const expts: string[] = parsedAttrs.exports || Object.keys(definitions)

	return expts.reduce<(IElmNode | Node)[]>((list, expt, i) => {
		// render large API title if it is default export
		// or it is the first export and the exports attribute was not custom
		const isInsertAPITitle = expt === 'default' || (!i && !parsedAttrs.exports)
		// render sub title for non-default export
		const isInsertSubTitle = expt !== 'default'
		const apiNode = deepmerge({}, node)

		// insert API title
		if (isInsertAPITitle) {
			list.push(
				{
					type: 'element',
					tagName: 'h2',
					properties: {},
					children: [{ type: 'text', value: 'API' }],
				},
				{
					type: 'text',
					value: '\n',
				}
			)
		}

		// insert export sub title
		if (isInsertSubTitle) {
			list.push(
				{
					type: 'element',
					tagName: 'h3',
					properties: { id: `api-${expt.toLowerCase()}` },
					children: [{ type: 'text', value: expt }],
				},
				{
					type: 'text',
					value: '\n',
				}
			)
		}

		// insert API Node
		delete apiNode.properties.exports
		apiNode.properties.identifier = identifier
		apiNode.properties.export = expt
		apiNode._parsed = true
		list.push(apiNode)

		return list
	}, [])
}

/**
 * detect component name via file path
 */
function guessComponentName(fileAbsPath: string) {
	const parsed = path.parse(fileAbsPath)

	if (parsed.name === 'index') {
		// button/index.tsx => button
		// button/src/index.tsx => button
		return path.basename(parsed.dir.replace(/\/src$/, ''))
	}

	// components/button.tsx => button
	return parsed.name
}

/**
 * watch component change to update api data
 * @param absPath       component absolute path
 * @param componentName component name
 * @param identifier    api identifier
 */
function watchComponentUpdate(absPath: string, componentName: string, identifier: string) {
	listenFileOnceChange(absPath, () => {
		let definitions: ReturnType<typeof parser>

		try {
			definitions = parser(absPath, componentName)
		} catch (err) {
			/* noting */
		}

		// watch next turn
		watchComponentUpdate(absPath, componentName, identifier)
	})
}

/**
 * remark plugin for parse embed tag to external module
 */
export default function api(this: any): IUnifiedTransformer {
	return (ast, vFile) => {
		visit<IElmNode>(ast, 'element', (node, i, parent) => {
			if (is(node, 'API') && !node._parsed) {
				let identifier: string = ''
				let definitions: ReturnType<typeof parser> | null = null

				const src = node.properties.src || ''
				// guess component name if there has no identifier property
				const componentName = node.properties.identifier || guessComponentName(src)
				const absPath = path.join(path.dirname(this.data('fileAbsPath')), src)

				definitions = parser(absPath, componentName)
				identifier = componentName || src

				// trigger listener to update previewer props after this file changed
				watchComponentUpdate(absPath, componentName, identifier)

				if (identifier && definitions) {
					// replace original node
					parent?.children.splice(i, 1, ...serializeAPINodes(node, identifier, definitions))
				}
			}
		})
	}
}
