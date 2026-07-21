/**
 * Utility functions for Arabic numbering, translation, and text rendering.
 */

export const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export function westernToArabicDigits(val: number | string): string {
  const str = String(val);
  return str.replace(/[0-9]/g, (d) => EASTERN_ARABIC_DIGITS[parseInt(d, 10)]);
}

/**
 * Converts Eastern Arabic digits (٠-٩) to Western digits (0-9)
 */
export function arabicToWesternDigits(val: string): string {
  return val.replace(/[٠-٩]/g, (d) => String(EASTERN_ARABIC_DIGITS.indexOf(d)));
}

interface ParsedStat {
  prefix: string;
  suffix: string;
  value: number;
  isArabicDigits: boolean;
}

/**
 * Parses an Arabic statistic string (e.g. "٢٥+", "٪٩٥", "120") into its component parts
 * so it can be animated from 0 to its target value.
 */
export function parseStatNumber(str: string): ParsedStat | null {
  const s = str || '';
  // Match prefix, numeric digits (either Arabic or Western), and suffix
  const m = s.match(/^([^\d٠-٩]*)([\d٠-٩]+)([^\d٠-٩]*)$/);
  if (!m) return null;

  const prefix = m[1];
  const digits = m[2];
  const suffix = m[3];

  const hasArabicDigits = /[٠-٩]/.test(digits);
  const westernDigits = hasArabicDigits ? arabicToWesternDigits(digits) : digits;
  const value = parseInt(westernDigits, 10);

  if (isNaN(value)) return null;

  return {
    prefix,
    suffix,
    value,
    isArabicDigits: hasArabicDigits,
  };
}

/**
 * Formats a running statistic value based on the original format
 */
export function formatStatValue(parsed: ParsedStat, currentValue: number): string {
  const rounded = Math.round(currentValue);
  const digitsStr = parsed.isArabicDigits
    ? westernToArabicDigits(String(rounded))
    : String(rounded);
  return parsed.prefix + digitsStr + parsed.suffix;
}
