import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import { rollupImportMapPlugin } from "rollup-plugin-import-map";

// rollup.config.mjs
export default {
	input: './index.js',
	output: {
		file: './production.js',
		format: 'es',
        plugins: [
            terser()
        ]
	},
    plugins: [rollupImportMapPlugin('import-map.json')]
    
    /*,
    plugins: [
        del({ targets: './public/dist/*'})
    ]*/
};