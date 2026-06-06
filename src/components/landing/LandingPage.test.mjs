import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'LandingPage.tsx'), 'utf8');

function getPlatformFeatures() {
  const featuresBlock = source.match(/const platformFeatures = \[(?<features>[\s\S]*?)\];/)?.groups
    ?.features;

  assert.ok(featuresBlock, 'LandingPage should define platformFeatures');

  return [
    ...featuresBlock.matchAll(
      /\{\s*name: '([^']+)',\s*body: '([^']+)',\s*status: '([^']+)',\s*\}/g,
    ),
  ].map(([, name, body, status]) => ({ name, body, status }));
}

test('landing platform cards show the requested names, order, and pending states', () => {
  const features = getPlatformFeatures();

  assert.deepEqual(
    features.map((feature) => feature.name),
    ['Compute', 'Storage', 'Database', 'Network'],
  );
  assert.equal(features.find((feature) => feature.name === 'Storage')?.status, 'available');
  assert.equal(
    features.find((feature) => feature.name === 'Compute')?.body,
    'VM 생성, 웹 터미널, SSH, 도메인 연결.',
  );
  assert.equal(features.find((feature) => feature.name === 'Storage')?.body, '파일과 폴더 업로드.');
  assert.deepEqual(
    features.filter((feature) => feature.status === 'pending').map((feature) => feature.name),
    ['Database', 'Network'],
  );
  assert.equal(source.includes('Cloud Database'), false);
});

test('landing platform details are available for compute and storage only', () => {
  assert.match(source, /const platformFeatureDetails = \{/);
  assert.match(source, /Compute:\s*\{/);
  assert.match(source, /Storage:\s*\{/);
  assert.doesNotMatch(source, /Database:\s*\{/);
  assert.doesNotMatch(source, /Network:\s*\{/);
  assert.equal(
    source.includes('VM 생성부터 접속, 배포 도메인 연결까지 한 흐름으로 관리합니다.'),
    true,
  );
  assert.equal(
    source.includes('컨테이너 안에 파일과 폴더를 올리고 필요한 형태로 내려받습니다.'),
    true,
  );
});
