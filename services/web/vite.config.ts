import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            "@web": path.resolve(__dirname, "./src"),
            "@ui": path.resolve(__dirname, "./src/components/ui"),
            "@pkg": path.resolve(__dirname, "../packages"),
        },
    },
    define: {
        process: {
            env: {}
        }
    },
    server: {
        hmr: {
            path: "/__vite_hmr",
        },
    }
})
