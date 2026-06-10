import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'vite';

// Injects the server-rendered landing page into dist/index.html so crawlers
// (search engines, AI bots) see real content without executing JS.
// dist/404.html is intentionally left empty: deep links are auth-gated routes.
const ROOT_PLACEHOLDER = '<div id="root"></div>';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { render } = await vite.ssrLoadModule('/src/entry-prerender.tsx');
  const appHtml = render();

  const indexPath = join(process.cwd(), 'dist', 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');
  if (!indexHtml.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`prerender: "${ROOT_PLACEHOLDER}" not found in dist/index.html`);
  }
  // Replacer function: a plain string replacement would reinterpret $-patterns
  // ($&, $`, ...) that can appear in rendered markup.
  await writeFile(
    indexPath,
    indexHtml.replace(ROOT_PLACEHOLDER, () => `<div id="root">${appHtml}</div>`),
  );
  console.log('prerender: landing page injected into dist/index.html');
} finally {
  await vite.close();
}
