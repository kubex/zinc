/// <reference types="vitest" />
import {defineConfig} from "vite";
import * as path from "node:path";

const getPackageName = () =>
{
  return 'zn';
};

const getPackageNameCamelCase = () =>
{
  return getPackageName().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const fileName = {
  iife: `${getPackageName()}.min.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: getPackageNameCamelCase(),
      formats,
      fileName: format => fileName[format],
    },
    terserOptions: {
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        assetFileNames: assetInfo =>
        {
          if(assetInfo.name === 'style.css') return 'zn.min.css';
          return assetInfo.name;
        }
      }
    }
  },
  test: {},
  resolve: {
    alias: [
      {find: "@", replacement: path.resolve(__dirname, 'src')},
      {find: "@@", replacement: path.resolve(__dirname)},
    ]
  }
});
