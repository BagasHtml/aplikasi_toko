const ALLOWED_CHARS = /^[0-9+\s().-]+$/;
const NORMALIZED = /^\+628[1-9][0-9]{6,10}$/;

export function normalizePhone(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!ALLOWED_CHARS.test(trimmed)) return '';
  let digits = trimmed.replace(/[\s().-]/g, '');
  if (digits.startsWith('+62')) digits = digits.slice(3);
  else if (digits.startsWith('62')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  else return '';
  if (!digits.startsWith('8')) return '';
  return `+62${digits}`;
}

export function validatePhone(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { ok: false, message: 'Nomor telepon wajib diisi.' };
  }
  if (!ALLOWED_CHARS.test(raw.trim())) {
    return {
      ok: false,
      message: 'Nomor hanya boleh berisi angka, spasi, tanda hubung, atau awalan +62.',
    };
  }
  const normalized = normalizePhone(raw);
  if (!normalized) {
    return {
      ok: false,
      message: 'Nomor harus diawali 08, 628, atau +628. Contoh: 0812-3456-7890.',
    };
  }
  if (!NORMALIZED.test(normalized)) {
    return {
      ok: false,
      message: 'Panjang nomor tidak wajar. Nomor HP Indonesia terdiri dari 9 sampai 13 angka.',
    };
  }
  const national = normalized.slice(3);
  if (/^(\d)\1+$/.test(national.slice(1))) {
    return {
      ok: false,
      message: 'Nomor terlihat asal-asalan karena semua angkanya sama. Periksa kembali.',
    };
  }
  return { ok: true, value: normalized, message: '' };
}

export function formatPhone(normalized) {
  if (typeof normalized !== 'string' || !normalized.startsWith('+62')) return normalized ?? '';
  const national = normalized.slice(3);
  const parts = [national.slice(0, 3), national.slice(3, 7), national.slice(7)].filter(Boolean);
  return `+62 ${parts.join('-')}`;
}
