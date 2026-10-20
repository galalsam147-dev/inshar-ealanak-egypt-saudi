/**
 * Privacy & Data Masking Utilities
 * تشفير وإخفاء أرقام الهواتف والحسابات البنكية وإنستاباي مثل التطبيقات العالمية لحماية الخصوصية
 */

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length <= 6) return clean;
  // Keep first 4 and last 3 digits, mask middle with bullet points
  const start = clean.slice(0, 4);
  const end = clean.slice(-3);
  return `${start} •••• ${end}`;
}

export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function maskIban(iban: string): string {
  if (!iban) return '';
  const clean = iban.replace(/\s+/g, '');
  if (clean.length <= 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start} •••• •••• •••• ${end}`;
}

export function maskInstaPayHandle(handle: string): string {
  if (!handle) return '';
  if (handle.includes('@')) {
    const [name, domain] = handle.split('@');
    const start = name.slice(0, 2);
    return `${start}••••@${domain}`;
  }
  if (handle.length <= 4) return handle;
  return `${handle.slice(0, 3)}••••${handle.slice(-2)}`;
}

export function maskNationalId(id: string): string {
  if (!id) return '';
  const clean = id.trim();
  if (clean.length <= 6) return '••••••';
  return `${clean.slice(0, 3)} ••••••• ${clean.slice(-3)}`;
}
