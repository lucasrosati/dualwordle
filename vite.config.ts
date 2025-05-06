import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  // ──────────────── DEV SERVER ────────────────
  server: {
    host: '::',
    port: 8080,
    // ⇣ Em alguns sistemas de arquivos (ex. macOS + Docker) o HMR
    //   não detecta mudanças; polling garante atualização.
    watch: { usePolling: true },
  },

  // ──────────────── PLUG‑INS ────────────────
  plugins: [
    react(),
    mode === 'development' && componentTagger(), // Lovable
  ].filter(Boolean),

  // ──────────────── RESOLUÇÃO DE CAMINHOS ────────────────
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ──────────────── IMPORTAR .wasm COMO ASSET ────────────────
  /** Isto instrui o Vite a copiar qualquer arquivo .wasm
   *  para o dev‑server e para a build final, permitindo
   *  import ... from 'engine.wasm?url'
   */
  assetsInclude: ['**/*.wasm'],
}));
