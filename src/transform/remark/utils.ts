import fs from 'fs'

/* 监听文件变化 */
export interface IWatcherItem {
	listeners?: ((event: string, filename: string) => void)[]
	watcher: fs.FSWatcher
}

const isDev = () => process.env.NODE_ENV === 'development' || process.env.TEST_WATCHER
const watchers: Record<string, IWatcherItem | null> = {}

export const closeFileWatcher = (filePath: string) => {
	// close & remove listeners
	watchers[filePath]?.watcher.close()
	watchers[filePath] = null
}

export const listenFileOnceChange = (filePath: string, listener: (event: string, filename: string) => void) => {
	if (isDev()) {
		watchers[filePath] = watchers[filePath] || {
			listeners: [],
			watcher: fs.watch(filePath, (...args) => {
				const listeners = watchers[filePath]?.listeners
				// close watcher if change triggered
				closeFileWatcher(filePath)
				listeners?.forEach((fn) => fn(...args))
			}),
		}
		watchers[filePath]?.listeners?.push(listener)
	}
}

/* 文件缓存 */
export default class FileCache {
	cache: Record<string, { filePath: string; updatedTime: number; value: any }> = {}

	add(filePath: string, value: any, key?: string) {
		this.cache[key || filePath] = {
			filePath,
			value,
			updatedTime: fs.lstatSync(filePath).mtimeMs,
		}
	}

	get(key: string) {
		let result

		if (this.cache[key] && fs.lstatSync(this.cache[key].filePath).mtimeMs === this.cache[key].updatedTime) {
			result = this.cache[key].value
		}

		return result
	}
}

/* 获取参数 */
const ATTR_MAPPING = {
	hideactions: 'hideActions',
	defaultshowcode: 'defaultShowCode',
}

/**
 * parse custome HTML element attributes to properties
 * @note  1. empty attribute will convert to true
 *        2. JSON-like string will convert to JSON
 *        3. workaround for restore property to camlCase that caused by hast-util-raw
 * @param   attrs   original attributes
 * @return  parsed properties
 */
export const parseElmAttrToProps = (attrs: Record<string, string>) => {
	const parsed: Record<string, any> = Object.assign({}, attrs)

	// restore camelCase attrs, because hast-util-raw will transform camlCase to lowercase
	Object.entries(ATTR_MAPPING).forEach(([mark, attr]) => {
		if (parsed[mark] !== undefined) {
			parsed[attr] = parsed[mark]
			delete parsed[mark]
		}
	})

	// convert empty string to boolean
	Object.keys(parsed).forEach((attr) => {
		if (parsed[attr] === '') {
			parsed[attr] = true
		}
	})

	// try to parse JSON field value
	Object.keys(parsed).forEach((attr) => {
		if (/^(\[|{)[^]*(]|})$/.test(parsed[attr])) {
			try {
				parsed[attr] = JSON.parse(parsed[attr])
			} catch (err) {
				/* nothing */
			}
		}
	})

	return parsed
}
