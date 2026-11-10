export function normalizeAccountName(input: string): string {
  const name: string = input.trim();

  if (name.length === 0 || name.length > 100) {
    throw new Error('Account name must be 1-100 characters.');
  }

  return name;
}
