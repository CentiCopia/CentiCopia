import { normalizeName } from './names';

export function normalizeAccountName(input: string): string {
  return normalizeName('Account', input);
}
