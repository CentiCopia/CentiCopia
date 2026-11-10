export function formatCents(
  cents: number,
  currency: string = 'USD',
  locale?: string,
): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError('Amount must be an integer number of cents.');
  }

  // Avoid "-$0.00": Intl formats -0 with a minus sign.
  const dollars: number = cents === 0 ? 0 : cents / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(dollars);
}

export function parseCents(input: string): number | null {
  const text: string = input.trim().replaceAll(',', '');
  const match: RegExpExecArray | null = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(
    text,
  );

  if (match === null) return null;

  const [, sign, whole, fraction = ''] = match;
  const cents: number = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  if (!Number.isSafeInteger(cents)) return null;

  return sign === '-' && cents !== 0 ? -cents : cents;
}
