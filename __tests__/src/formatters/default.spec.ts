import { beforeEach, describe, expect, it } from 'bun:test';
import type * as CLint from '@commitlint/types';
import type * as Chalk from 'chalk';
import chalk from 'chalk';
import { type FormatOptions, Formatter, type LintReport } from 'src/blueprints';
import format, {
  formatter,
  formatInput,
  formatResult
} from 'src/formatters/default';

const signs = [chalk.green('✔'), chalk.yellow('⚠'), chalk.red('✖')];
const nL = '\n';
const nL2 = nL + nL;
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
const res = (texts: string[]): string[] => {
  return [texts.join('')];
};

describe('formatters > default', () => {
  let lintOutcome: CLint.LintOutcome;
  let lintReport: LintReport;
  let formatOptions: FormatOptions;
  const getFormatted = {
    input: (_lintOutcome?: CLint.LintOutcome) => {
      const { input } = _lintOutcome ?? lintOutcome;

      return res([chalk.bold('✉️ Commit Message'), nL2, input]);
    },
    result: (_lintOutcome?: CLint.LintOutcome) => {
      const { errors, warnings } = _lintOutcome ?? lintOutcome;
      const summarySign =
        signs[errors.length > 0 ? 2 : warnings.length > 0 ? 1 : 0];
      const problems = [...errors, ...warnings].map((problem) => {
        const sign = signs[problem.level];
        const name = chalk.gray(`[${problem.name}]`);

        return `${sign} ${problem.message} ${name}`;
      });
      const allGood = `${signs[0]} all good ${chalk.gray('[no-problem-found]')}`;
      const body = problems.length > 0 ? problems.join(nL) : allGood;
      const summary = chalk.bold(
        `${summarySign} Summary: found ${errors.length} errors and ${warnings.length} warnings.`
      );
      const help =
        formatOptions.helpUrl && problems.length > 0
          ? `${nL}Help: ${chalk.blueBright.underline(formatOptions.helpUrl)}`
          : '';

      return res([body, nL2, summary, help]);
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
    it('should return empty array if problem not exists', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];

      const formattedInput = formatInput(lintOutcome, formatOptions);

      expect(formattedInput).toEqual([]);
    });

    it('should correctly format input if problem not exists but verbose is true', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];
      formatOptions.verbose = true;

      const formattedInput = formatInput(lintOutcome, formatOptions);

      expect(formattedInput).toEqual(getFormatted.input());
    });

    it('should correctly format input if problem exists', () => {
      const formattedInput = formatInput(lintOutcome, formatOptions);
      expect(formattedInput).toEqual(getFormatted.input());
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

    it('should not contain helpUrl if problem not exists', () => {
      lintOutcome.errors = [];
      lintOutcome.warnings = [];
      formatOptions.verbose = true;
      formatOptions.helpUrl = 'www.test.com';

      expect(formatResult(lintOutcome, formatOptions)[0]).not.toContain(
        formatOptions.helpUrl
      );
    });
  });

  describe('format', () => {
    it('should format the full report correctly', () => {
      formatOptions.separatorBetweenInputAndResult = '';
      formatOptions.separatorBetweenCommits = '';
      formatOptions.finalizeFormatResult = (formatted) => formatted;
      lintReport.results = [lintOutcome, lintOutcome];

      const formattedReport = format(lintReport, formatOptions);
      const expected = lintReport.results
        .map((lintOutcome) =>
          [
            getFormatted.input(lintOutcome).join(''),
            getFormatted.result(lintOutcome).join('')
          ].join(formatOptions.separatorBetweenInputAndResult)
        )
        .join(formatOptions.separatorBetweenCommits);

      expect(formattedReport).toBe(expected);
    });

    describe('finalizeFormatResult', () => {
      const getSummary = () => {
        const summary = lintReport.results.reduce(
          (acc, curr) => {
            acc.totalCommit += 1;
            acc.totalError += curr.errors.length;
            acc.totalWarning += curr.warnings.length;

            return acc;
          },
          {
            totalCommit: 0,
            totalError: 0,
            totalWarning: 0
          }
        );
        const sign =
          summary.totalError > 0
            ? signs[2]
            : summary.totalWarning > 0
              ? signs[1]
              : signs[0];

        return { ...summary, sign };
      };

      it('should do nothing if only lint 1 commit', () => {
        const finalized = format(lintReport, formatOptions);
        const nonFinalized = format(lintReport, {
          ...formatOptions,
          finalizeFormatResult: undefined
        });
        expect(finalized).toBe(nonFinalized);
      });

      it('should do nothing if problem not exists or verbose is false', () => {
        lintOutcome.errors = [];
        lintOutcome.warnings = [];
        lintReport.results = [lintOutcome, lintOutcome];

        const finalized = format(lintReport, formatOptions);
        const nonFinalized = format(lintReport, {
          ...formatOptions,
          finalizeFormatResult: undefined
        });
        expect(finalized).toBe(nonFinalized);
      });

      it('should finalize format if problem not exists but verbose is true', () => {
        formatOptions.verbose = true;
        lintOutcome.errors = [];
        lintOutcome.warnings = [];
        lintReport.results = [lintOutcome, lintOutcome];

        const summary = getSummary();
        const finalized = format(lintReport, formatOptions);
        expect(finalized).toEndWith(
          res([
            nL2,
            '--------------------------------------',
            nL2,
            chalk.bold(
              `${summary.sign} Lint ${summary.totalCommit} commits. Found ${summary.totalError} errors and ${summary.totalWarning} warnings.`
            )
          ])[0]
        );
      });

      it('should finalize format if problem exists', () => {
        lintReport.results = [lintOutcome, lintOutcome];

        const summary = getSummary();
        const finalized = format(lintReport, formatOptions);
        expect(finalized).toEndWith(
          res([
            nL2,
            '--------------------------------------',
            nL2,
            chalk.bold(
              `${summary.sign} Lint ${summary.totalCommit} commits. Found ${summary.totalError} errors and ${summary.totalWarning} warnings.`
            )
          ])[0]
        );
      });
    });
  });

  describe('text color', () => {
    it('should use colored text by default', () => {
      lintReport.results = [
        lintOutcome,
        { ...lintOutcome, errors: [], warnings: [] }
      ];
      formatOptions.verbose = true;
      const formattedReport = format(lintReport, formatOptions);
      expect(formattedReport).toContain(ansi.bold);
      expect(formattedReport).toContain(ansi.gray);
      expect(formattedReport).toContain(ansi.red);
      expect(formattedReport).toContain(ansi.yellow);
      expect(formattedReport).toContain(ansi.green);
    });

    it('should not use colored text if `color` options is false', () => {
      formatOptions.color = false;
      lintReport.results = [
        lintOutcome,
        { ...lintOutcome, errors: [], warnings: [] }
      ];
      formatOptions.verbose = true;
      const formattedReport = format(lintReport, formatOptions);
      expect(formattedReport).not.toContain(ansi.bold);
      expect(formattedReport).not.toContain(ansi.gray);
      expect(formattedReport).not.toContain(ansi.red);
      expect(formattedReport).not.toContain(ansi.yellow);
      expect(formattedReport).not.toContain(ansi.green);
    });
  });
});
