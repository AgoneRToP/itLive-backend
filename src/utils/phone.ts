export function normalizePhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 998 and has 12 digits, format with '+'
  if (digits.length === 12 && digits.startsWith('998')) {
    return '+' + digits;
  }
  
  // If it has 9 digits (e.g. 901234567), prepend '+998'
  if (digits.length === 9) {
    return '+998' + digits;
  }
  
  // If it starts with '+' and has 12 digits starting with 998
  if (phone.trim().startsWith('+') && digits.length === 12 && digits.startsWith('998')) {
    return '+' + digits;
  }
  
  // Fallback for other formats
  if (digits.length > 0) {
    return '+' + digits;
  }
  
  return null;
}