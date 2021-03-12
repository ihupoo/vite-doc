import React from 'react'
import { Theme } from './style'
import Navbar from './components/Navbar'

export default function Layout() {
	return (
		<Theme>
			<Navbar title={'组件库'} />
			<SideMenu />
		</Theme>
	)
}
