/**
 * Centralized formatters for Vietnamese locale.
 * Re-exports from utils.ts for backward compatibility + adds new helpers.
 */

export { formatVND, formatNumber, formatDate, formatDateTime, numberToWords } from "./utils";

/**
 * Alias for formatVND
 */
export function formatCurrencyVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0 ₫";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₫";
  return (
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num) + " ₫"
  );
}

/**
 * Format date in Vietnamese format (dd/MM/yyyy)
 */
export function formatDateVN(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

/**
 * Format datetime in Vietnamese format (dd/MM/yyyy HH:mm)
 */
export function formatDateTimeVN(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

/**
 * Format phone number for Vietnamese format
 * @example formatPhoneVN("0901234567") → "090 123 4567"
 */
export function formatPhoneVN(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Parse money input string to number
 * @example parseMoneyInput("1.234.567") → 1234567
 */
export function parseMoneyInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[.\s₫đ]/g, "").replace(/,/g, ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
