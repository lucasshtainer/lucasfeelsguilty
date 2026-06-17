import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleLettersRequest, serveLettersJson } from './server/lettersApi.js';

function lettersApiPlugin() {
  return {
    name: 'letters-api',
    configureServer(server) {
      server.middlewares.use('/letters.json', (req, res) => {
        if (req.method === 'GET') {
          serveLettersJson(req, res);
          return;
        }
        res.statusCode = 405;
        res.end('Method not allowed');
      });
      server.middlewares.use('/api/letters', (req, res) => {
        handleLettersRequest(req, res);
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), lettersApiPlugin()]
});
