import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { handleLettersRequest } from './lettersApi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');
const port = Number(process.env.PORT) || 3000;

const app = express();

app.use('/api/letters', (req, res) => {
  handleLettersRequest(req, res);
});

app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`lucasfeelsguilty running at http://localhost:${port}`);
});
