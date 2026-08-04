// Local type shim for '@web/test-runner-commands', redirected via tsconfig `paths`.
// The package's own types transitively `/// <reference types="node" />` (via
// filePlugin.d.ts), which pollutes the whole program's global `setTimeout`
// return type. Runtime resolution (Vite/esbuild) is untouched - only `tsc`
// reads `paths`.
export function setViewport(viewport: {width: number; height: number}): Promise<void>;
