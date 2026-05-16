import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');

await copyFile(join(distDir, 'index.html'), join(distDir, '404.html'));
