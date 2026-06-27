import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert an empty string to null. Use before writing optional foreign-key
 * fields (uuid columns) to the database, since "" is not a valid uuid.
 */
export function emptyToNull<T>(value: T | "" | null | undefined): T | null {
  return value === "" || value === undefined ? null : value;
}

/**
 * Format a number as Vietnamese Dong currency
 * @example formatVND(1234567) → "1.234.567 ₫"
 */
export function formatVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0 ₫";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₫";
  return (
    new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(num) + " ₫"
  );
}

/**
 * Format a number with Vietnamese grouping (dots)
 * @example formatNumber(1234567) → "1.234.567"
 */
export function formatNumber(
  amount: number | string | null | undefined
): string {
  if (amount === null || amount === undefined) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
}

/**
 * Format a date in Vietnamese format
 * @example formatDate("2026-06-23") → "23/06/2026"
 */
export function formatDate(
  date: Date | string | null | undefined
): string {
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
 * Format a datetime in Vietnamese format
 * @example formatDateTime("2026-06-23T10:30:00") → "23/06/2026 10:30"
 */
export function formatDateTime(
  date: Date | string | null | undefined
): string {
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
 * Generate a sequential code with prefix
 * @example generateCode("KH", 5) → "KH00005"
 */
export function generateCode(prefix: string, sequence: number): string {
  return `${prefix}${String(sequence).padStart(5, "0")}`;
}

/**
 * Calculate percentage
 * @example calcPercentage(75000, 100000) → 75
 */
export function calcPercentage(
  part: number | string,
  total: number | string
): number {
  const p = typeof part === "string" ? parseFloat(part) : part;
  const t = typeof total === "string" ? parseFloat(total) : total;
  if (!t || t === 0) return 0;
  return Math.round((p / t) * 100);
}

/**
 * Convert a number to Vietnamese words
 */
export function numberToWords(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) return "Không đồng";

  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const unitsTen = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
  
  const readGroup3 = (g: number, isFirst: boolean): string => {
    let result = "";
    const h = Math.floor(g / 100);
    const t = Math.floor((g % 100) / 10);
    const u = g % 10;
    
    if (h > 0 || !isFirst) {
      result += units[h] + " trăm ";
    }
    
    if (t > 0) {
      result += unitsTen[t] + " ";
    } else if (h > 0 && u > 0) {
      result += "lẻ ";
    }
    
    if (u > 0) {
      if (t > 1 && u === 1) {
        result += "mốt";
      } else if (t > 0 && u === 5) {
        result += "lăm";
      } else {
        result += units[u];
      }
    }
    return result.trim();
  };

  let word = "";
  let temp = Math.floor(n);
  const unitsLarge = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  let groupIndex = 0;
  
  while (temp > 0) {
    const group = temp % 1000;
    if (group > 0) {
      const groupWord = readGroup3(group, Math.floor(temp / 1000) === 0);
      word = groupWord + " " + unitsLarge[groupIndex] + " " + word;
    }
    temp = Math.floor(temp / 1000);
    groupIndex++;
  }
  
  word = word.trim();
  if (word === "") return "Không đồng";
  // Capitalize first letter
  word = word.charAt(0).toUpperCase() + word.slice(1);
  return word + " đồng chẵn.";
}
