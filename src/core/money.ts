export function formatCents(
  cents: number,
  currency: string = "USD",
  locale?: string,
): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError("Amount must be an integer number of cents.");
  }

  // Avoid "-$0.00": Intl formats -0 with a minus sign.
  const dollars: number = cents === 0 ? 0 : cents / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(dollars);
}
