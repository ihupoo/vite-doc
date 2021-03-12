import React from 'react'
import { Wrap } from './style'

interface NavbarProps {
	title: string
}

export default function Navbar(props: NavbarProps) {
	return (
		<Wrap>
			<button className="toggle" />
			<a rel="noopener noreferrer" href="./">
				{props.title}
			</a>
			<nav>
				{/* <SearchBar /> */}
				<ul>
					<li></li>
				</ul>
			</nav>
		</Wrap>
	)
}
