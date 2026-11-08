import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, Plugin} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function zohoDevPlugin(): Plugin {
  return {
    name: 'zoho-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/zoho/leads', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            let parsed: any = {};
            try {
              parsed = JSON.parse(body);
            } catch {
              // fallback
            }
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                referenceNumber: parsed.referenceNumber || 'AES-DEV-LEAD',
                zohoLeadId: `dev_lead_${Date.now()}`,
                simulated: true,
              })
            );
          });
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 405;
        res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), zohoDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three/')) {
              return 'vendor-three';
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
