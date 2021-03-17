import React from 'react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'

export function Link(props: LinkProps) {
	const { to, ...res } = props
	return (
		<Link
			to={props.to}
			{...res}
			onClick={(e) => {
				window.scrollTo({ top: 0 })
				props.onClick?.(e)
			}}
		/>
	)
}
