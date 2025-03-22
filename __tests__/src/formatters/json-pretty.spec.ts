import { beforeEach, describe, expect, it } from 'bun:test';
import type * as CLint from '@commitlint/types';
import type * as Chalk from 'chalk';
import chalk from 'chalk';
import { type FormatOptions, Formatter, type LintReport } from 'src/blueprints';
import format, {
  formatter,
  formatInput,
  formatResult
} from 'src/formatters/json-pretty';

const signs = ['✔', '⚠', '✖'];
const ansi = new Proxy(
  {},
  {
    get: (_, key: Chalk.ColorName | Chalk.ModifierName) => {
      const temp = chalk[key]('_');
      const ansi = temp.split('_')[0];

      return ansi;
    }
  }
) as Record<Chalk.ColorName | Chalk.ModifierName, string>;
const res = (obj: object): string[] => {
  return [JSON.stringify(obj, null, 2)];
};

describe('formatters > json-pretty', () => {
  let lintOutcome: CLint.LintOutcome;
  let lintReport: LintReport;
  let formatOptions: FormatOptions;
  const getFormatted = {
    result: (_lintOutcome?: CLint.LintOutcome) => {
      const { input, errors, warnings } = _lintOutcome ?? lintOutcome;

      const problems = [...errors, ...warnings].map((problem) => {
        const sign = signs[problem.level];
        return {
          ...problem,
          sign
        };
      });
      const summary = {
        sign: signs[errors.length > 0 ? 2 : warnings.length > 0 ? 1 : 0],
        errorCount: errors.length,
        warningCount: warnings.length
      };
      const helpUrl = formatOptions.helpUrl;

      return res({
        input,
        problems,
        summary,
        helpUrl
      });
    }
  };

  beforeEach(() => {
    lintOutcome = {
      valid: false,
      input: 'fix: something',
      errors: [
        {
          level: 2,
          message: 'message1',
          name: 'error1',
          valid: false
        }
      ],
      warnings: [
        {
          level: 1,
          message: 'message2',
          name: 'warning1',
          valid: false
        }
      ]
    };

    lintReport = {
      valid: true,
      errorCount: 1,
      warningCount: 1,
      results: [lintOutcome]
    };

    formatOptions = {};
  });

  describe('formatter instance', () => {
    it('should be an instance of Formatter factory', () => {
      expect(formatter).toBeInstanceOf(Formatter);
    });

    it('should have customizable set to false', () => {
      expect(formatter.isCustomizable).toBe(false);
    });
  });

  describe('formatInput', () => {
    it('should return empty array', () => {
      const formattedInput = formatInput(lintOutcome, formatOptions);
      expect(formattedInput).toEqual([]);
    });
  });

  describe('formatResult', () => {
    it('should return empty array if problem not exists', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];

      const formattedResult = formatResult(lintOutcome, formatOptions);
      expect(formattedResult).toEqual([]);
    });

    it('should correctly format result if problem not exists but verbose is true', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];
      formatOptions.verbose = true;

      const formattedResult = formatResult(lintOutcome, formatOptions);
      expect(formattedResult).toEqual(getFormatted.result());
    });

    it('should correctly format result if problem exists', () => {
      const formattedResult = formatResult(lintOutcome, formatOptions);
      expect(formattedResult).toEqual(getFormatted.result());
    });

    it('should contain helpUrl if problem exists', () => {
      formatOptions.helpUrl = 'www.test.com';
      expect(formatResult(lintOutcome, formatOptions)[0]).toContain(
        formatOptions.helpUrl
      );
    });

    it('should contain helpUrl if problem not exists', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];
      formatOptions.verbose = true;
      formatOptions.helpUrl = 'www.test.com';

      expect(formatResult(lintOutcome, formatOptions)[0]).toContain(
        formatOptions.helpUrl
      );
    });
  });

  describe('format', () => {
    it('should format the full report correctly', () => {
      lintReport.results = [lintOutcome, lintOutcome];

      const formattedReport = format(lintReport, formatOptions);
      const expected = JSON.stringify(
        JSON.parse(
          `[${lintReport.results
            .map((lintOutcome) => getFormatted.result(lintOutcome).join(''))
            .join(formatOptions.separatorBetweenCommits)}]`
        ),
        null,
        2
      );

      expect(formattedReport).toBe(expected);
    });

    describe('finalizeFormatResult', () => {
      it('should finalize format', () => {
        const finalized = format(lintReport);
        const nonFinalized = format(lintReport, {
          ...formatOptions,
          finalizeFormatResult: undefined
        });
        expect(finalized).not.toBe(nonFinalized);
      });
    });
  });

  describe('text color', () => {
    beforeEach(() => {
      formatOptions.color = true;
      formatOptions.finalizeFormatResult = (formatted, context) => {
        const { chalk } = context;

        return chalk.red(formatted);
      };
    });

    it('should never use colored text', () => {
      const formattedReport = format(lintReport, formatOptions);
      expect(formattedReport).not.toContain(ansi.red);
    });
  });
});
