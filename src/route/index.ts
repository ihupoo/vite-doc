export interface INavItem {
	title: string
	path?: string
	[key: string]: any
}

export type INav = Record<string, INavItem[]>

export interface IMenuItem {
	title: string
	path: string
	meta?: Record<string, any>
	children?: IMenuItem[]
}

export type IMenu = Record<
	string,
	{
		[key: string]: IMenuItem[]
	}
>

export interface ISlugItem {
	heading: string
	value: string
	depth: number
}

export interface IRoute {
	path: string
	component?: string
	exact?: boolean
	routes?: IRoute[]
	title?: string
	[key: string]: any
}
