import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleLettersRequest } from './server/lettersApi.js';

function lettersApiPlugin() {
  return {
    name: 'letters-api',
    configureServer(server) {
      server.middlewares.use('/api/letters', (req, res) => {
        handleLettersRequest(req, res);
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), lettersApiPlugin()]
});
