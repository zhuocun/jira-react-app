import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiUrl =
        env.REACT_APP_API_URL || env.VITE_API_URL || "http://localhost:8001";

    return {
        build: {
            chunkSizeWarningLimit: 1600
        },
        define: {
            "process.env.REACT_APP_API_URL": JSON.stringify(apiUrl)
        },
        plugins: [react(), svgr()]
    };
});
