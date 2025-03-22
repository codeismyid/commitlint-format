import { afterEach, beforeEach, describe, expect, it, jest } from 'bun:test';
import type * as CLint from '@commitlint/types';
import type { ChalkInstance } from 'chalk';
import {
  type FormatOptions,
  Formatter,
  type FormatterOptions,
  type LintReport,
  type TransformContext,
  type Transformer
} from 'src/blueprints/Formatter';

const createLintOutcome = (options?: {
  errorCount?: number;
  warningCount?: number;
}): CLint.LintOutcome => {
  return {
    errors: Array<CLint.LintRuleOutcome>(options?.errorCount || 0).fill({
      level: 2,
      message: 'error',
      name: 'err',
      valid: false
    }),
    warnings: Array<CLint.LintRuleOutcome>(options?.warningCount || 0).fill({
      level: 1,
      message: 'warning',
      name: 'warn',
      valid: true
    }),
    valid: !options?.errorCount && !options?.warningCount,
    input: 'commit message'
  };
};

const createLintReport = (results: LintReport['results'] = []): LintReport => {
  const lintReport = results.reduce(
    (acc, curr) => {
      acc.errorCount += curr.errors.length ?? 0;
      acc.warningCount += curr.warnings.length ?? 0;
      return acc;
    },
    {
      errorCount: 0,
      warningCount: 0,
      valid: true,
      results
    } as LintReport
  );

  if (lintReport.errorCount > 0) {
    lintReport.valid = false;
  }

  return lintReport;
};

describe('blueprints > Formatter', () => {
  let mockChalk: ChalkInstance;
  let mockTransformer: Record<keyof Transformer, jest.Mock>;
  let formatter: Formatter;
  let formatterOptions: Required<FormatterOptions>;
  const getContext = (
    _formatOptions?: Partial<FormatOptions>
  ): TransformContext => {
    const formatOptions = {
      ...formatterOptions.formatOptions,
      ..._formatOptions
    };

    return {
      formatOptions,
      chalk: mockChalk,
      verbose: Boolean(formatOptions?.verbose),
      getSign: expect.any(Function)
    };
  };

  beforeEach(() => {
    mockChalk = {
      level: 1,
      green: jest.fn().mockReturnValue('green'),
      yellow: jest.fn().mockReturnValue('yellow'),
      red: jest.fn().mockReturnValue('red')
    } as unknown as ChalkInstance;

    mockTransformer = {
      transformInput: jest.fn().mockReturnValue(['formatted input']),
      transformResult: jest.fn().mockReturnValue(['formatted result'])
    };

    formatterOptions = {
      customizable: false,
      formatOptions: {}
    };
    formatter = new Formatter(mockTransformer, mockChalk, formatterOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatInput', () => {
    describe('verbose is true', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = true;
      });

      it('should return formatted input even if problem does not exists', () => {
        const lintOutcome = createLintOutcome({
          errorCount: 0,
          warningCount: 0
        });

        expect(formatter.formatInput(lintOutcome)).toEqual(['formatted input']);
      });

      it('should call transformInput with the correct context', () => {
        const lintOutcomes = [
          createLintOutcome({ errorCount: 0, warningCount: 0 }),
          createLintOutcome({ errorCount: 1, warningCount: 0 }),
          createLintOutcome({ errorCount: 0, warningCount: 1 }),
          createLintOutcome({ errorCount: 1, warningCount: 1 })
        ];

        lintOutcomes.forEach((lintOutcome, index) => {
          formatter.formatInput(lintOutcome);
          expect(mockTransformer.transformInput).toHaveBeenCalledTimes(
            index + 1
          );
          expect(mockTransformer.transformInput).toHaveBeenLastCalledWith(
            lintOutcome,
            getContext()
          );
        });
      });
    });

    describe('verbose is false', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = false;
      });

      it('should return empty array if problem does not exists', () => {
        const lintOutcome = createLintOutcome({
          errorCount: 0,
          warningCount: 0
        });

        expect(formatter.formatInput(lintOutcome)).toEqual([]);
      });

      it('should call transformInput with the correct context', () => {
        const lintOutcomes = [
          createLintOutcome({ errorCount: 1, warningCount: 0 }),
          createLintOutcome({ errorCount: 0, warningCount: 1 }),
          createLintOutcome({ errorCount: 1, warningCount: 1 })
        ];

        lintOutcomes.forEach((lintOutcome, index) => {
          formatter.formatInput(lintOutcome);
          expect(mockTransformer.transformInput).toHaveBeenCalledTimes(
            index + 1
          );
          expect(mockTransformer.transformInput).toHaveBeenLastCalledWith(
            lintOutcome,
            getContext()
          );
        });
      });
    });

    describe('options behavior', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = true;
        formatterOptions.formatOptions.color = true;
      });

      it('should use value from instance options ', () => {
        const lintOutcome = createLintOutcome({ errorCount: 1 });

        formatter.formatInput(lintOutcome);
        expect(mockTransformer.transformInput).toHaveBeenLastCalledWith(
          lintOutcome,
          getContext()
        );
      });

      it('should prioritize value from arguments', () => {
        const lintOutcome = createLintOutcome({ errorCount: 1 });

        formatter.formatInput(lintOutcome, { color: false });
        expect(mockTransformer.transformInput).toHaveBeenLastCalledWith(
          lintOutcome,
          getContext({ verbose: true, color: false })
        );
      });
    });
  });

  describe('formatResult', () => {
    describe('verbose is true', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = true;
      });

      it('should return formatted result even if problem does not exists', () => {
        const lintOutcome = createLintOutcome({
          errorCount: 0,
          warningCount: 0
        });

        expect(formatter.formatResult(lintOutcome)).toEqual([
          'formatted result'
        ]);
      });

      it('should call transformResult with the correct context', () => {
        const lintOutcomes = [
          createLintOutcome({ errorCount: 0, warningCount: 0 }),
          createLintOutcome({ errorCount: 1, warningCount: 0 }),
          createLintOutcome({ errorCount: 0, warningCount: 1 }),
          createLintOutcome({ errorCount: 1, warningCount: 1 })
        ];

        lintOutcomes.forEach((lintOutcome, index) => {
          formatter.formatResult(lintOutcome);
          expect(mockTransformer.transformResult).toHaveBeenCalledTimes(
            index + 1
          );
          expect(mockTransformer.transformResult).toHaveBeenLastCalledWith(
            lintOutcome,
            getContext()
          );
        });
      });
    });

    describe('verbose is false', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = false;
      });

      it('should return empty array if problem does not exists', () => {
        const lintOutcome = createLintOutcome({
          errorCount: 0,
          warningCount: 0
        });

        expect(formatter.formatResult(lintOutcome)).toEqual([]);
      });

      it('should call transformResult with the correct context', () => {
        const lintOutcomes = [
          createLintOutcome({ errorCount: 1, warningCount: 0 }),
          createLintOutcome({ errorCount: 0, warningCount: 1 }),
          createLintOutcome({ errorCount: 1, warningCount: 1 })
        ];

        lintOutcomes.forEach((lintOutcome, index) => {
          formatter.formatResult(lintOutcome);
          expect(mockTransformer.transformResult).toHaveBeenCalledTimes(
            index + 1
          );
          expect(mockTransformer.transformResult).toHaveBeenLastCalledWith(
            lintOutcome,
            getContext()
          );
        });
      });
    });

    describe('options behavior', () => {
      beforeEach(() => {
        formatterOptions.formatOptions.verbose = true;
        formatterOptions.formatOptions.color = true;
      });

      it('should use value from instance options ', () => {
        const lintOutcome = createLintOutcome({ errorCount: 1 });

        formatter.formatResult(lintOutcome);
        expect(mockTransformer.transformResult).toHaveBeenLastCalledWith(
          lintOutcome,
          getContext()
        );
      });

      it('should prioritize value from arguments', () => {
        const lintOutcome = createLintOutcome({ errorCount: 1 });

        formatter.formatResult(lintOutcome, { color: false });
        expect(mockTransformer.transformResult).toHaveBeenLastCalledWith(
          lintOutcome,
          getContext({ color: false, verbose: true })
        );
      });
    });
  });

  describe('format', () => {
    it('should format the report correctly', () => {
      const lintReport = createLintReport([
        createLintOutcome({ warningCount: 1, errorCount: 1 })
      ]);

      const formatted = formatter.format(lintReport);

      expect(formatted).toContain('formatted input');
      expect(formatted).toContain('formatted result');
    });

    it('should add prefix correctly', () => {
      formatterOptions.formatOptions.prefix = 'prefix';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toStartWith(formatterOptions.formatOptions.prefix);
    });

    it('should add suffix correctly', () => {
      formatterOptions.formatOptions.suffix = 'suffix';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toEndWith(formatterOptions.formatOptions.suffix);
    });

    it('should add eachCommitPrefix correctly', () => {
      formatterOptions.formatOptions.eachCommitPrefix = 'prefix';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toIncludeRepeated(
        formatterOptions.formatOptions.eachCommitPrefix,
        3
      );
    });

    it('should add eachCommitSuffix correctly', () => {
      formatterOptions.formatOptions.eachCommitSuffix = 'suffix';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toIncludeRepeated(
        formatterOptions.formatOptions.eachCommitSuffix,
        3
      );
    });

    it('should add the separatorBetweenCommits correctly', () => {
      formatterOptions.formatOptions.separatorBetweenCommits = '---';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toIncludeRepeated(
        formatterOptions.formatOptions.separatorBetweenCommits,
        2
      );
    });

    it('should add the separatorBetweenInputAndResult correctly', () => {
      formatterOptions.formatOptions.separatorBetweenInputAndResult = '~~~';

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toIncludeRepeated(
        formatterOptions.formatOptions.separatorBetweenInputAndResult,
        2
      );
    });

    it('should handle finalizeFormatResult correctly', () => {
      const finalizeFn = jest.fn((formatted: string) => {
        return `${formatted} - finalized`;
      });
      formatterOptions.formatOptions.finalizeFormatResult = finalizeFn;

      const lintReport = createLintReport(
        Array(3).fill(createLintOutcome({ errorCount: 1 }))
      );

      const formatted = formatter.format(lintReport);

      expect(formatted).toEndWith(' - finalized');
      expect(finalizeFn).toHaveBeenCalledTimes(1);
      expect(finalizeFn).toHaveBeenLastCalledWith(
        expect.any(String),
        getContext(),
        {
          totalCommit: lintReport.results.length,
          totalError: lintReport.errorCount,
          totalWarning: lintReport.warningCount
        }
      );
    });

    it('should handle empty report result gracefully', () => {
      const lintReport = createLintReport([]);

      const formatted = formatter.format(lintReport);

      expect(formatted).toBe('');
    });
  });

  describe('setTransformer', () => {
    it('should update the transformer if customizable', () => {
      formatterOptions.customizable = true;

      const newTransformer: Transformer = {
        transformInput: jest.fn().mockReturnValue(['custom formatted input']),
        transformResult: jest.fn().mockReturnValue(['custom formatted result'])
      };

      formatter.setTransformer(newTransformer);

      const lintOutcome = {
        errors: ['error1'],
        warnings: []
      } as unknown as CLint.LintOutcome;

      const formattedInput = formatter.formatInput(lintOutcome);
      const formattedResult = formatter.formatResult(lintOutcome);

      expect(formattedInput).toEqual(['custom formatted input']);
      expect(formattedResult).toEqual(['custom formatted result']);
    });

    it('should throw an error if not customizable', () => {
      expect(() => formatter.setTransformer(mockTransformer)).toThrow(
        'formatter is not customizable.'
      );
    });

    it('should throw an error if not valid', () => {
      formatterOptions.customizable = true;

      expect(() => formatter.setTransformer({} as Transformer)).toThrow(
        '`transformInput` is not a function.'
      );

      expect(() =>
        formatter.setTransformer({
          transformInput: () => []
        } as unknown as Transformer)
      ).toThrow('`transformResult` is not a function.');
    });
  });

  describe('setFormatOptions', () => {
    it('should update the format options', () => {
      const formatOptions: FormatOptions = {
        colors: ['white', 'white', 'white'],
        signs: ['', 'warning', 'error']
      };

      formatter.setFormatOptions(formatOptions);

      const lintOutcome = createLintOutcome({ errorCount: 1 });

      formatter.formatInput(lintOutcome);
      expect(mockTransformer.transformInput).toHaveBeenLastCalledWith(
        lintOutcome,
        getContext(formatOptions)
      );
    });
  });

  describe('isCustomizable', () => {
    it('should return true if customizable value is true', () => {
      formatterOptions.customizable = true;
      expect(formatter.isCustomizable).toBe(true);
    });

    it('should return false if customizable value is false', () => {
      formatterOptions.customizable = false;
      expect(formatter.isCustomizable).toBe(false);
    });
  });
});
