import { Chalk } from 'chalk';
import { Formatter } from 'src/blueprints';

const nL = '%0A';
const nL2 = nL + nL;

/**
 * Github Actions Annotation formatter instance.
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

      const type =
        result.errors.length > 0
          ? 'error'
          : result.warnings.length > 0
            ? 'warning'
            : 'debug';

      formatted += `::${type}::✉️ Commit Message${nL2}${result.input}${nL2}`;

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
          const name = `[${problem.name}]`;

          formatted += `${sign} ${message} ${name}${nL}`;
        }
      } else {
        const sign = getSign(0);
        const message = 'all good';
        const name = '[no-problem-found]';

        formatted += `${sign} ${message} ${name}${nL}`;
      }

      const summaryLevel =
        result.errors.length > 0 ? 2 : result.warnings.length > 0 ? 1 : 0;
      const summarySign = getSign(summaryLevel);
      formatted += nL;
      formatted += `${summarySign} Summary: found ${result.errors.length} errors and ${result.warnings.length} warnings.`;

      if (hasProblem && helpUrl) {
        formatted += nL2;
        formatted += `Help: ${helpUrl}.`;
      }

      return [formatted];
    }
  },
  new Chalk({ level: 0 }),
  {
    customizable: false,
    formatOptions: {
      separatorBetweenInputAndResult: nL2
    }
  }
);

export const formatInput = formatter.formatInput;
export const formatResult = formatter.formatResult;
export default formatter.format;
