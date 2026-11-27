import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function precacheAssets(): Plugin {
  return {
    name: 'precache-assets',
    apply: 'build',
    writeBundle(options, bundle) {
      const urls = Object.keys(bundle).map((file) => `/${file}`);
      const swPath = path.join(options.dir ?? 'dist', 'sw.js');
      const source = fs.readFileSync(swPath, 'utf8');
      fs.writeFileSync(
        swPath,
        source.replace(
          'const BUILT_ASSETS = [];',
          `const BUILT_ASSETS = ${JSON.stringify(urls)};`,
        ),
      );
    },
  };
}

export default defineConfig({
  plugins: [precacheAssets()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
});
