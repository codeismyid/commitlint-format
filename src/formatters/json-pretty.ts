import type * as CLint from '@commitlint/types';
import { Chalk } from 'chalk';
import { Formatter } from 'src/blueprints';

/**
 * JSON Pretty formatter instance.
 */
export const formatter = new Formatter(
  {
    transformInput: () => [],
    transformResult: (result, context) => {
      const {
        formatOptions: { helpUrl },
        getSign
      } = context;
      let formatted = '';
      let problems: (CLint.LintRuleOutcome & { sign: string })[] = [];
      const errorCount = result.errors.length;
      const warningCount = result.warnings.length;
      const hasProblem = errorCount > 0 || warningCount > 0;

      if (hasProblem) {
        problems = [...result.errors, ...result.warnings].map((problem) => {
          return {
            ...problem,
            sign: getSign(problem.level)
          };
        });
      }

      formatted = JSON.stringify(
        {
          input: result.input,
          problems,
          summary: {
            sign: getSign(errorCount > 0 ? 2 : warningCount > 0 ? 1 : 0),
            errorCount,
            warningCount
          },
          helpUrl
        },
        null,
        2
      );

      return [formatted];
    }
  },
  new Chalk({ level: 0 }),
  {
    customizable: false,
    formatOptions: {
      finalizeFormatResult: (formatted) => {
        return JSON.stringify(JSON.parse(`[${formatted}]`), null, 2);
      },
      separatorBetweenCommits: ','
    }
  }
);

export const { formatInput, formatResult } = formatter;
export default formatter.format;
