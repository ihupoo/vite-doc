import * as parser from 'react-docgen-typescript'
import FileCache from '../utils'

const cacher = new FileCache()
// ref: https://github.com/styleguidist/react-docgen-typescript/blob/048980a/src/parser.ts#L1110
const DEFAULT_EXPORTS = [
	'default',
	'__function',
	'Stateless',
	'StyledComponentClass',
	'StyledComponent',
	'FunctionComponent',
	'StatelessComponent',
	'ForwardRefExoticComponent',
]

interface ApiProp {
	/**
	 * component property name
	 */
	identifier: string
	/**
	 * component property label
	 */
	name?: string
	/**
	 * component property description
	 */
	description?: string
	/**
	 * component property type
	 */
	type: string
	/**
	 * component property default value
	 */
	default?: string
	/**
	 * property whether required
	 */
	required?: boolean

	// [key: string]: any
}

export type IApiDefinition = Record<string, ApiProp[]>

export default function Parser(filePath: string, componentName?: string) {
	let definitions: IApiDefinition = cacher.get(filePath)
	const isDefaultRegExp = new RegExp(`^${componentName}$`, 'i')

	if (!definitions) {
		let defaultDefinition: IApiDefinition[''] | null = null

		definitions = {}
		parser
			.withCompilerOptions(
				{ esModuleInterop: true, jsx: 'preserve' as any },
				{
					savePropValueAsString: true,
					shouldExtractLiteralValuesFromEnum: true,
					shouldRemoveUndefinedFromOptional: true,
					componentNameResolver: (source) => {
						// use parsed component name from remark pipeline as default export's displayName
						return DEFAULT_EXPORTS.includes(source.getName()) ? componentName : undefined
					},
				}
			)
			.parse(filePath)
			.forEach((item) => {
				// convert result to IApiDefinition
				const exportName = isDefaultRegExp.test(item.displayName) ? 'default' : item.displayName
				const props = Object.entries(item.props).map(([identifier, prop]) => {
					const result = { identifier } as ApiProp
					const fields = ['identifier', 'description', 'type', 'defaultValue', 'required']

					fields.forEach((field) => {
						switch (field) {
							case 'type':
								result.type = prop.type.raw || prop.type.name
								break

							case 'description':
								if (prop.description) {
									result.description = prop.description
								}
								break

							case 'defaultValue':
								if (prop[field]) {
									result.default = prop[field].value
								}
								break

							case 'required':
								if (prop[field]) {
									result.required = prop[field]
								}
								break

							default:
							// if (prop[field]) {
							// 	result[field] = prop[field]
							// }
						}
					})

					return result
				})

				if (exportName === 'default') {
					defaultDefinition = props
				} else {
					definitions[exportName] = props
				}
			})

		// to make sure default export always in the top
		if (defaultDefinition) {
			definitions = Object.assign({ default: defaultDefinition }, definitions)
		}
	}

	cacher.add(filePath, definitions)

	return definitions
}
