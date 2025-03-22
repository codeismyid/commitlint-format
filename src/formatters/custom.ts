import { Chalk } from 'chalk';
import { Formatter } from 'src/blueprints';

const notImplementedError = new Error('need to `setTransformer` first.');

/**
 * Custom formatter instance.
 */
export const formatter = new Formatter(
  {
    transformInput: () => {
      throw notImplementedError;
    },
    transformResult: () => {
      throw notImplementedError;
    }
  },
  new Chalk(),
  { customizable: true }
);

export const { formatInput, formatResult } = formatter;
export default formatter.format;
