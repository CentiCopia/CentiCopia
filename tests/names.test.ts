import { describe, expect, it } from 'vitest';
import {
  editDistance,
  findExactName,
  findNearName,
  nameKey,
} from '../src/core/names';

describe('nameKey()', (): void => {
  it('trims spaces and ignores case', (): void => {
    expect(nameKey('  Main Checking  ')).toBe('main checking');
  });
});

describe('findExactName()', (): void => {
  it('matches ignoring case and spaces', (): void => {
    expect(findExactName(['Main Checking'], ' MAIN CHECKING ')).toBe(
      'Main Checking',
    );
    expect(findExactName(['Main Checking'], 'Savings')).toBeUndefined();
  });
});

describe('editDistance()', (): void => {
  it('is zero for identical names', (): void => {
    expect(editDistance('Checking', 'Checking')).toBe(0);
  });

  it('counts a one-letter typo as one edit', (): void => {
    expect(editDistance('Checking', 'Cheking')).toBe(1);
  });
});

describe('findNearName()', (): void => {
  it('ignores an exact match', (): void => {
    expect(findNearName(['Checking'], ' CHECKING ')).toBeUndefined();
  });

  it('suggests the existing spelling for a typo', (): void => {
    expect(findNearName(['Main Checking'], 'Main Checkng')).toBe(
      'Main Checking',
    );
  });

  it('allows two edits in a longer name', (): void => {
    expect(findNearName(['Main Checking'], 'Man Cheking')).toBe(
      'Main Checking',
    );
  });

  it('ignores an unrelated name', (): void => {
    expect(findNearName(['Savings'], 'Checking')).toBeUndefined();
  });
});
