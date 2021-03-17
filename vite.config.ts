//@ts-nocheck

import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [reactRefresh()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
})
