import assert from 'node:assert/strict';
import { validatePhone, normalizePhone, formatPhone } from '../shared/phone.js';

const valid = [
  ['081234567890', '+6281234567890'],
  ['+62 812-3456-7890', '+6281234567890'],
  ['6281234567890', '+6281234567890'],
  ['0812 3456 7890', '+6281234567890'],
  ['0899-1234-567', '+628991234567'],
];

for (const [input, expected] of valid) {
  const result = validatePhone(input);
  assert.equal(result.ok, true, `Harus valid: ${input}`);
  assert.equal(result.value, expected, `Normalisasi salah untuk ${input}`);
  assert.equal(normalizePhone(input), expected);
}

const invalid = [
  '',
  '   ',
  '12345',
  '0812',
  'abcdefghij',
  '0811111111',
  '0000000000',
  '+621234567890',
  '0812 3456 7890 ext 9',
  '08123456789012345',
];

for (const input of invalid) {
  const result = validatePhone(input);
  assert.equal(result.ok, false, `Harus ditolak: ${input}`);
  assert.ok(result.message.length > 10, `Pesan error harus jelas untuk: ${input}`);
}

assert.equal(formatPhone('+6281234567890'), '+62 812-3456-7890');

console.log(`LULUS uji validasi nomor telepon (${valid.length} valid, ${invalid.length} ditolak)`);
