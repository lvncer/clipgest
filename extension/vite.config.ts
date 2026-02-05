import { readdirSync } from "node:fs";
import { extname, resolve } from "node:path";
import { defineConfig } from "vite";

const srcDir = resolve(__dirname, "src");

function getEntryPoints(): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const dirent of readdirSync(srcDir, { withFileTypes: true })) {
    if (!dirent.isFile()) continue;
    if (extname(dirent.name) !== ".ts") continue;

    const name = dirent.name.replace(/\.ts$/, "");
    entries[name] = resolve(srcDir, dirent.name);
  }

  return entries;
}

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "chrome120",
    rollupOptions: {
      input: getEntryPoints(),
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
