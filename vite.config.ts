import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    {
      name: 'update-mock-data',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/update-status' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { type, id, status } = JSON.parse(body);
                const filePath = path.resolve(__dirname, './src/assets/mockData.tsx');
                let content = fs.readFileSync(filePath, 'utf-8');
                const arrayName = type === 'Event' ? 'events' : 'bulletins';
                const lines = content.split('\n');
                let inTargetArray = false;
                let inTargetObject = false;
                let braceDepth = 0;
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].includes(`export const ${arrayName} = [`)) {
                    inTargetArray = true;
                    continue;
                  }
                  if (inTargetArray) {
                    if (lines[i].includes('{')) braceDepth++;
                    if (lines[i].includes('}')) braceDepth--;
                    if (!inTargetObject && braceDepth > 0) {
                      const idLineMatch = lines[i].match(/id:\s*(['"]?)([^'"\s,]+)\1,/);
                      if (idLineMatch && String(idLineMatch[2]) === String(id)) {
                        inTargetObject = true;
                      }
                    }
                    if (inTargetObject) {
                      if (lines[i].match(/status:\s*["'][^"']+["']/)) {
                        lines[i] = lines[i].replace(/(status:\s*)["'][^"']+["']/, `$1"${status}"`);
                        break;
                      }
                    }
                    if (braceDepth === 0 && lines[i].trim() === '];') {
                      break;
                    }
                  }
                }
                fs.writeFileSync(filePath, lines.join('\n'));
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err?.message || 'Error parsing' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/app/pages'),
    },
  },
  server: {
    allowedHosts: [
      'localhost',
      'winjoe.local',
    ],
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
