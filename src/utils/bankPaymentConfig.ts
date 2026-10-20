/**
 * إعدادات الدفع الإلكتروني المباشر لكل مشترك بشكل مستقل
 */

export const OFFICIAL_PAYMENT_CONFIG = {
  bankName: '',
  bankNameEn: '',
  branchName: '',
  accountNumber: '',
  iban: '',
  swiftCode: '',
  beneficiaryName: '',
  vodafoneCashPhone: '',
  maskedVodafoneCashPhone: '',
  instaPayPhone: '',
  maskedInstaPayPhone: '',
  instaPayHandle: '',
  maskedAccountNumber: '',
  maskedIban: '',
  securityNotice: '🛡️ التحويل المالي يتم مباشرة لصاحب النشاط أو الكابتن عبر حساباته المستقلة.',
  visaRoutingEnabled: true,
  instantSettlement: true,
};

export const OFFICIAL_BANK_CONFIG = OFFICIAL_PAYMENT_CONFIG;
