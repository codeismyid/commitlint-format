import { describe, expect, it } from 'bun:test';
import * as Commitlint from 'src/formatters/@commitlint';
import * as Standard from 'src/formatters/standard';

describe('formatters > standard', () => {
  it('should the same as @commitlint', () => {
    expect(Standard).toEqual(Commitlint);
  });
});
