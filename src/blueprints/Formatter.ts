import type * as CLint from '@commitlint/types';
import type { ChalkInstance, ColorSupportLevel } from 'chalk';

const CTX = Symbol('context');
const DEFAULT_SIGNS = ['✔', '⚠', '✖'] as const;
const DEFAULT_COLORS = ['green', 'yellow', 'red'] as const;
const DEFAULT_FORMATTER_OPTIONS: FormatterOptions = {
  customizable: false,
  formatOptions: {
    colors: DEFAULT_COLORS,
    signs: DEFAULT_SIGNS
  }
};

/**
 * A class to create formatter instance for formatting the linting report.
 */
export class Formatter {
  #transformer: Transformer;
  #chalk: ChalkInstance;
  #chalkOriginalLevel: ColorSupportLevel;
  #options: FormatterOptions;

  /**
   * Creates an instance of the Formatter.
   * @param transformer The transformer object that handles input and result transformations.
   * @param chalk The `chalk` instance used to style the output.
   * @param options Optional formatting options.
   */
  constructor(
    transformer: Transformer,
    chalk: ChalkInstance,
    options?: FormatterOptions
  ) {
    this.#transformer = transformer;
    this.#chalk = chalk;
    this.#chalkOriginalLevel = chalk.level;
    this.#options = options || DEFAULT_FORMATTER_OPTIONS;
  }

  /**
   * Gets the context to be passed to the transformation functions.
   * @param result The linting outcome of a commit.
   * @param formatOptions Additional formatting options.
   * @returns The format context.
   * @internal
   */
  #getContext = (
    _formatOptions?: FormatOptions,
    reusable?: boolean
  ): TransformContext => {
    if (_formatOptions?.[CTX]) {
      return _formatOptions[CTX];
    }

    const formatOptions: FormatOptions = {
      ...this.#options.formatOptions,
      ..._formatOptions
    };
    const colors = formatOptions.colors || DEFAULT_COLORS;
    const signs = formatOptions.signs || DEFAULT_SIGNS;

    switch (formatOptions?.color) {
      case undefined:
      case true: {
        this.#chalk.level = this.#chalkOriginalLevel;
        break;
      }
      case false: {
        this.#chalk.level = 0;
      }
    }
    const context: TransformContext = {
      formatOptions,
      chalk: this.#chalk,
      verbose: Boolean(formatOptions.verbose),
      getSign: (level) => {
        return context.chalk[colors[level]](signs[level]);
      }
    };

    if (reusable) {
      Object.defineProperty(context.formatOptions, CTX, {
        enumerable: false,
        value: { ...context, formatOptions: { ...formatOptions } }
      });
    }

    return context;
  };

  /** Whether the formatter is customizable. */
  get isCustomizable() {
    return Boolean(this.#options.customizable);
  }

  /**
   * Sets a new transformer for the formatter.
   * @param transformer The new transformer to be used.
   * @throws Will throw an error if the formatter is not customizable.
   * @throws Will throw an error if `transformInput` or `transformResult` are not functions.
   */
  setTransformer = (transformer: Transformer) => {
    if (!this.#options.customizable) {
      throw new Error('formatter is not customizable.');
    }

    if (typeof transformer.transformInput !== 'function') {
      throw new TypeError('`transformInput` is not a function.');
    }

    if (typeof transformer.transformResult !== 'function') {
      throw new TypeError('`transformResult` is not a function.');
    }

    this.#transformer.transformInput = transformer.transformInput;
    this.#transformer.transformResult = transformer.transformResult;
  };

  /**
   * Sets the format options for the formatter.
   * @param formatOptions The format options to be applied.
   */
  setFormatOptions = (formatOptions: FormatOptions) => {
    this.#options.formatOptions = {
      ...this.#options.formatOptions,
      ...formatOptions
    };
  };

  /**
   * Formats the input of a linting result (commit message).
   * @param result The linting outcome.
   * @param formatOptions Optional format options.
   * @returns A string array with the formatted input.
   */
  formatInput = (
    result: CLint.LintOutcome,
    formatOptions?: FormatOptions
  ): string[] => {
    const context = this.#getContext(formatOptions);
    const hasProblem = result.errors.length > 0 || result.warnings.length > 0;

    if (hasProblem || context.verbose) {
      return this.#transformer.transformInput(result, context);
    }

    return [];
  };

  /**
   * Formats the result of a linting outcome.
   * @param result The linting outcome.
   * @param formatOptions Optional format options.
   * @returns A string array with the formatted result.
   */
  formatResult = (
    result: CLint.LintOutcome,
    formatOptions?: FormatOptions
  ): string[] => {
    const context = this.#getContext(formatOptions);
    const hasProblem = result.errors.length > 0 || result.warnings.length > 0;

    if (hasProblem || context.verbose) {
      return this.#transformer.transformResult(result, context);
    }

    return [];
  };

  /**
   * Formats the entire lint report into a string.
   * @param report The lint report containing multiple linting outcomes.
   * @param formatOptions Optional format options.
   * @returns A string with the formatted lint report.
   */
  format = (report: LintReport, formatOptions?: FormatOptions): string => {
    let formatted = '';
    const results = report.results;

    if (!results.length) {
      return formatted;
    }

    const context = this.#getContext(formatOptions, true);
    const {
      prefix = '',
      suffix = '',
      eachCommitPrefix = '',
      eachCommitSuffix = '',
      separatorBetweenCommits = '\n',
      separatorBetweenInputAndResult = '\n',
      finalizeFormatResult
    } = context.formatOptions;
    const lastIndex = results.length - 1;
    const summary = {
      totalCommit: results.length,
      totalError: 0,
      totalWarning: 0
    };

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      summary.totalError += result.errors.length;
      summary.totalWarning += result.warnings.length;

      const formattedInput = this.formatInput(
        result,
        context.formatOptions
      ).join('');
      const formattedResult = this.formatResult(
        result,
        context.formatOptions
      ).join('');

      formatted += eachCommitPrefix;
      formatted += formattedInput;
      if (formattedInput) {
        formatted += separatorBetweenInputAndResult;
      }
      formatted += formattedResult;
      formatted += eachCommitSuffix;

      const isFormattedNotEmpty = Boolean(formattedInput || formattedResult);
      if (isFormattedNotEmpty && i !== lastIndex) {
        formatted += separatorBetweenCommits;
      }
    }

    formatted = `${prefix}${formatted}${suffix}`;

    if (finalizeFormatResult) {
      formatted = finalizeFormatResult(formatted, context, summary);
    }

    return formatted;
  };
}

/**
 * Represents the result of a linting process.
 */
export type LintReport = {
  /** Whether the linting is valid (i.e., no errors or warnings). */
  valid: boolean;
  /** Number of errors encountered during linting. */
  errorCount: number;
  /** Number of warnings encountered during linting. */
  warningCount: number;
  /** Array of linting outcomes for individual commits. */
  results: CLint.LintOutcome[];
};

/**
 * Detailed format options for customizing the report output.
 */
export type FormatOptions = {
  /** @internal */
  [CTX]?: TransformContext;
  /** Prefix to be used for formatted report. Only affects `format` method. */
  prefix?: string;
  /** Suffix to be used for formatted report. Only affects `format` method. */
  suffix?: string;
  /** Prefix to be used each formatted commit result in the report. Only affects `format` method. */
  eachCommitPrefix?: string;
  /** Suffix to be used each formatted commit result in the report (added before separatorBetweenCommits text). Only affects `format` method. */
  eachCommitSuffix?: string;
  /** Separator to be used between each commit in the report. Only affects `format` method. Defaults to `\n`. */
  separatorBetweenCommits?: string;
  /** Separator to be used between formatted input and formatted result. Only affects `format` method and if `formatInput` not resulting empty. Defaults to `\n`. */
  separatorBetweenInputAndResult?: string;
  /** Finalizing result. Only for `format` method. */
  finalizeFormatResult?: (
    formatted: string,
    context: TransformContext,
    summary: {
      totalCommit: number;
      totalError: number;
      totalWarning: number;
    }
  ) => string;
} & CLint.FormatOptions;

/**
 * Options for formatting the linting report.
 */
export type FormatterOptions = {
  /** Whether the formatter is customizable. */
  customizable: boolean;
  /** Custom format options. */
  formatOptions?: FormatOptions;
};

/**
 * Context passed to the transform functions.
 */
export type TransformContext = {
  /** Options used for formatting. */
  formatOptions: FormatOptions;
  /** The `chalk` instance used for styling the output. */
  chalk: ChalkInstance;
  /** Whether formatting with verbose or not */
  verbose: boolean;
  /** A function that retrieves the appropriate sign (e.g., ✔, ⚠, ✖) based on the linting level. */
  getSign: (level: CLint.RuleConfigSeverity) => string;
};

/**
 * A function that transforms a linting outcome and its context into a string array.
 */
export type TransformFn = (
  result: CLint.LintOutcome,
  context: TransformContext
) => string[];

/**
 * Object containing the functions to transform the input and the final result.
 */
export type Transformer = {
  /** Function to transform the input (commit message) of the linting result. */
  transformInput: TransformFn;
  /** Function to transform the final linting result output. */
  transformResult: TransformFn;
};
