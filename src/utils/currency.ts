import { SupportedCurrency } from '../types';

export interface CurrencyInfo {
  code: SupportedCurrency;
  nameAr: string;
  nameEn: string;
  symbol: string;
  rateToEgp: number; // How many EGP per 1 unit of this currency (e.g. 1 USD = 49 EGP)
  flag: string;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  EGP: { code: 'EGP', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', symbol: 'ج.م', rateToEgp: 1, flag: '🇪🇬' },
  USD: { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', rateToEgp: 49.20, flag: '🇺🇸' },
  EUR: { code: 'EUR', nameAr: 'يورو أوروبي', nameEn: 'Euro', symbol: '€', rateToEgp: 53.40, flag: '🇪🇺' },
  SAR: { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'SAR', rateToEgp: 13.12, flag: '🇸🇦' },
  AED: { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'AED', rateToEgp: 13.40, flag: '🇦🇪' },
  CNY: { code: 'CNY', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan', symbol: '¥', rateToEgp: 6.85, flag: '🇨🇳' },
  RUB: { code: 'RUB', nameAr: 'روبل روسي', nameEn: 'Russian Ruble', symbol: '₽', rateToEgp: 0.52, flag: '🇷🇺' },
  UAH: { code: 'UAH', nameAr: 'هريفنيا أوكرانية', nameEn: 'Ukrainian Hryvnia', symbol: '₴', rateToEgp: 1.18, flag: '🇺🇦' },
  GBP: { code: 'GBP', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', symbol: '£', rateToEgp: 63.80, flag: '🇬🇧' },
};

/**
 * Extracts numeric EGP value from price string or service
 */
export function extractEgpAmount(priceStr: string): number {
  if (!priceStr) return 0;
  // Match any digits at the beginning or before currency symbol
  const match = priceStr.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? 0 : val;
  }
  return 0;
}

/**
 * Converts an EGP amount into any supported target currency
 */
export function convertFromEgp(egpAmount: number, target: SupportedCurrency): string {
  if (target === 'EGP') {
    return `${egpAmount.toLocaleString('en-US')} ج.م`;
  }
  const curr = CURRENCIES[target];
  if (!curr || curr.rateToEgp <= 0) return `${egpAmount} ج.م`;
  const converted = egpAmount / curr.rateToEgp;
  // Format nicely
  const formatted = converted < 10 ? converted.toFixed(1) : Math.round(converted).toLocaleString('en-US');
  return `${formatted} ${curr.symbol}`;
}

/**
 * Formats a dynamic service price into the selected currency
 */
export function formatServicePrice(rawPrice: string, targetCurrency: SupportedCurrency): string {
  if (targetCurrency === 'EGP') return rawPrice;
  const egp = extractEgpAmount(rawPrice);
  if (egp <= 0) return rawPrice;
  const converted = convertFromEgp(egp, targetCurrency);
  return `${converted} (${rawPrice})`;
}
