import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(number: number, decimal: number = 2): string {
  const absNumber = Math.abs(number);
  const fixedNumber = decimal > 0 ? absNumber.toFixed(decimal) : Math.round(absNumber).toString();
  const [integerPart, decimalPart] = fixedNumber.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decimal > 0 && decimalPart) {
    return `${formattedInteger}.${decimalPart}`;
  } else {
    return formattedInteger;
  }
}