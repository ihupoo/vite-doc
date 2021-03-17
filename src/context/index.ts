import { IMenu, IMenuItem, INav, INavItem, IRoute } from '@/route'
import React from 'react'

export interface IContext {
	config: {
		title: string
		repository: {
			url?: string
			branch: string
			platform?: string
		}
		navs: INav
		menus: IMenu
	}
	meta: {
		title: string
		sidemenu?: boolean
		toc?: false | 'content' | 'menu'
		[key: string]: any
	}
	menu: IMenuItem[]
	nav: INavItem[]
	base: string
	routes: (IRoute & { meta: any })[]
}

const context = React.createContext<IContext>({
	config: {
		title: '',
		navs: {},
		menus: {},
		repository: { branch: 'master' },
	},
	meta: { title: '' },
	menu: [],
	nav: [],
	base: '',
	routes: [],
})

export default context
