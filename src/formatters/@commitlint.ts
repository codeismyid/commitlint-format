import { Chalk } from 'chalk';
import { Formatter } from 'src/blueprints';

/**
 * Standard formatter instance (based on {@link https://www.npmjs.com/package/@commitlint/format @commitlint/format}).
 */
export const formatter = new Formatter(
  {
    transformInput: (result, context) => {
      const { chalk } = context;
      const commitMsg = chalk.bold(result.input);
      const sign = chalk.gray('⧗');
      const formatted = `${sign}   input: ${commitMsg}`;

      return [formatted];
    },
    transformResult: (result, context) => {
      const { chalk, formatOptions, getSign } = context;

      let formatted = '';
      const errorCount = result.errors.length;
      const warningCount = result.warnings.length;
      const hasProblem = errorCount > 0 || warningCount > 0;

      if (hasProblem) {
        const problems = [...result.errors, ...result.warnings];

        for (let i = 0; i < problems.length; i++) {
          const problem = problems[i];
          const level = problem.level;
          const sign = getSign(level);
          const message = problem.message;
          const name = chalk.gray(`[${problem.name}]`);

          formatted += `${sign}   ${message} ${name}\n`;
        }

        formatted += '\n';
      }

      const summaryLevel = errorCount > 0 ? 2 : warningCount > 0 ? 1 : 0;
      const summarySign = getSign(summaryLevel);
      formatted += chalk.bold(
        `${summarySign}   found ${result.errors.length} problems, ${result.warnings.length} warnings`
      );

      if (hasProblem && formatOptions.helpUrl) {
        formatted += '\n';
        formatted += `ⓘ   Get Help: ${formatOptions.helpUrl}`;
        formatted += '\n';
      }

      return [formatted];
    }
  },
  new Chalk(),
  {
    customizable: false,
    formatOptions: {
      separatorBetweenInputAndResult: '\n'
    }
  }
);

export const { formatInput, formatResult } = formatter;
export default formatter.format;
