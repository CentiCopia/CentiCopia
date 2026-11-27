export function normalizeName(label: string, input: string): string {
  const name: string = input.trim();

  if (name.length === 0 || name.length > 100) {
    throw new Error(`${label} name must be 1-100 characters.`);
  }

  return name;
}

export function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function findExactName(
  existing: readonly string[],
  candidate: string,
): string | undefined {
  const wanted: string = nameKey(candidate);
  return existing.find((name: string): boolean => nameKey(name) === wanted);
}

export function editDistance(left: string, right: string): number {
  let previous: number[] = Array.from(
    { length: right.length + 1 },
    (_, index: number): number => index,
  );

  for (let i = 1; i <= left.length; i += 1) {
    const current: number[] = [i];
    for (let j = 1; j <= right.length; j += 1) {
      const cost: number = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    previous = current;
  }

  return previous[right.length];
}

export function findNearName(
  existing: readonly string[],
  candidate: string,
): string | undefined {
  const wanted: string = nameKey(candidate);
  const maxDistance: number = wanted.length >= 8 ? 2 : 1;

  return existing.find((name: string): boolean => {
    const key: string = nameKey(name);
    return key !== wanted && editDistance(key, wanted) <= maxDistance;
  });
}
