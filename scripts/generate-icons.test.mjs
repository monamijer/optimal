import test from 'node:test';
import assert from 'node:assert/strict';
import { usedIcons, build } from './generate-icons.mjs';

test('usedIcons keeps only real icons, once, sorted', () => {
  const known = { house: 0xf425, 'arrow-right': 0xf138 };
  const texts = ['<i class="bi bi-house"></i> bi-nope', 'class="bi bi-arrow-right bi-house"', '.bi-arrow-right::before'];
  assert.deepEqual(usedIcons(texts, known), ['arrow-right', 'house']);
});

test('the generated files cover every icon used by the app', async () => {
  const { css, names } = await build();
  assert.ok(names.length > 10);
  for (const n of names) assert.match(css, new RegExp(`\\.bi-${n}::before \\{ content: "\\\\[0-9a-f]+"; \\}`));
});
