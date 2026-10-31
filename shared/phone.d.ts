export function normalizePhone(raw: string): string;
export function validatePhone(raw: string): {
  ok: boolean;
  value?: string;
  message: string;
};
export function formatPhone(normalized: string): string;
