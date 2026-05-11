// Excludes confusable characters: 0/O, 1/I/L
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export const PROMO_CODE_MIN_LENGTH = 3;
export const PROMO_CODE_MAX_LENGTH = 24;

export function generatePromoCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export const PROMO_CODE_REGEX = /^[A-Z0-9%_-]{3,24}$/;

export function isValidPromoCodeFormat(code: string): boolean {
  return PROMO_CODE_REGEX.test(code);
}
