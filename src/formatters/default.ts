import { Chalk } from 'chalk';
import { Formatter } from 'src/blueprints';

/**
 * Default formatter instance.
 */
export const formatter = new Formatter(
  {
    transformInput: (result, context) => {
      const { chalk } = context;
      const header = chalk.bold('✉️ Commit Message');
      const commitMsg = result.input;
      const formatted = `${header}\n\n${commitMsg}`;

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

          formatted += `${sign} ${message} ${name}\n`;
        }
      } else {
        const sign = getSign(0);
        const message = 'all good';
        const name = chalk.gray('[no-problem-found]');

        formatted = `${sign} ${message} ${name}\n`;
      }

      const summaryLevel = errorCount > 0 ? 2 : warningCount > 0 ? 1 : 0;
      const summarySign = getSign(summaryLevel);
      formatted += '\n';
      formatted += chalk.bold(
        `${summarySign} Summary: found ${result.errors.length} errors and ${result.warnings.length} warnings.`
      );

      if (hasProblem && formatOptions.helpUrl) {
        formatted += '\n\n';
        formatted += `Help: ${chalk.blueBright.underline(formatOptions.helpUrl)}.`;
      }

      return [formatted];
    }
  },
  new Chalk(),
  {
    customizable: false,
    formatOptions: {
      separatorBetweenCommits: '\n\n--------------------------------------\n\n',
      separatorBetweenInputAndResult: '\n\n',
      finalizeFormatResult: (_formatted, context, summary) => {
        const { chalk, verbose, getSign } = context;
        const { totalCommit, totalError, totalWarning } = summary;
        const hasProblem = totalError > 0 || totalWarning > 0;

        if ((hasProblem || verbose) && totalCommit > 1) {
          let formatted = _formatted;

          formatted += '\n\n--------------------------------------\n\n';

          const summaryLevel = totalError > 0 ? 2 : totalWarning > 0 ? 1 : 0;
          const summarySign = getSign(summaryLevel);
          formatted += chalk.bold(
            `${summarySign} Lint ${totalCommit} commits. Found ${totalError} errors and ${totalWarning} warnings.`
          );

          return `${formatted}`;
        }

        return _formatted;
      }
    }
  }
);

export const { formatInput, formatResult } = formatter;
export default formatter.format;
