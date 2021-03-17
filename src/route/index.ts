export interface INavItem {
	title: string
	path?: string
	children: INavItem[]
	[key: string]: any
}

export type INav = Record<string, INavItem[]>

export interface IMenuItem {
	path?: string
	title: string
	meta?: Record<string, any>
	children?: IMenuItem[]
}

export type IMenu = Record<
	string,
	{
		[key: string]: IMenuItem[]
	}
>

export interface IRoute {
	component?: string
	exact?: boolean
	path?: string
	routes?: IRoute[]
	title?: string
	[key: string]: any
}
