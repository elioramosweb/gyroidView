import react from '@vitejs/plugin-react'
import { transformWithEsbuild } from 'vite'
import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'

export default {
    root: 'src/',
    publicDir: '../public/',
    plugins: [
        // Reinicia el servidor al cambiar archivos públicos
        restart({ restart: ['../public/**'] }),

        // Soporte para React
        react(),

        // Soporte para shaders con #include y #define
        glsl({
            include: /\.(glsl|wgsl|vert|frag|vs|fs)$/, // extensiones soportadas
            defaultExtension: 'glsl', // opcional
            compress: false, // para debugging, no minifica
        }),

        // Carga archivos .js como si fueran JSX
        {
            name: 'load+transform-js-files-as-jsx',
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) return null

                return transformWithEsbuild(code, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                });
            },
        },
    ],
    server: {
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env),
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
    },
}