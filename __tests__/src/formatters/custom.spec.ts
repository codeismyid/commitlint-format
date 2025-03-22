import { beforeEach, describe, expect, it, jest } from 'bun:test';
import type * as CLint from '@commitlint/types';
import {
  type FormatOptions,
  Formatter,
  type LintReport,
  type Transformer
} from 'src/blueprints';
import format, {
  formatter,
  formatInput,
  formatResult
} from 'src/formatters/custom';

const notImplementedError = new Error('need to `setTransformer` first.');

describe('formatters > custom', () => {
  let lintOutcome: CLint.LintOutcome;
  let lintReport: LintReport;
  let formatOptions: FormatOptions;

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

    it('should have customizable set to true', () => {
      expect(formatter.isCustomizable).toBe(true);
    });
  });

  describe('without setup', () => {
    describe('formatInput', () => {
      it('should throw an error when transformInput is called', () => {
        expect(() => {
          formatInput(lintOutcome, formatOptions);
        }).toThrow(notImplementedError);
      });
    });

    describe('formatResult', () => {
      it('should throw an error when transformResult is called', () => {
        expect(() => {
          formatResult(lintOutcome, formatOptions);
        }).toThrow(notImplementedError);
      });
    });

    describe('format', () => {
      it('should throw an error', () => {
        expect(() => {
          format(lintReport, formatOptions);
        }).toThrow(notImplementedError);
      });
    });
  });

  describe('with setup', () => {
    let transformer: Transformer;

    beforeEach(() => {
      transformer = {
        transformInput: jest.fn().mockReturnValue([]),
        transformResult: jest.fn().mockReturnValue([])
      };

      formatter.setTransformer(transformer);
    });

    describe('formatInput', () => {
      it('should call custom input transformer', () => {
        expect(transformer.transformInput).toHaveBeenCalledTimes(0);
        formatInput(lintOutcome, formatOptions);
        expect(transformer.transformInput).toHaveBeenCalledTimes(1);
      });
    });

    describe('formatResult', () => {
      it('should call custom result transformer', () => {
        expect(transformer.transformResult).toHaveBeenCalledTimes(0);
        formatResult(lintOutcome, formatOptions);
        expect(transformer.transformResult).toHaveBeenCalledTimes(1);
      });
    });

    describe('format', () => {
      it('should call custom transformer', () => {
        expect(transformer.transformInput).toHaveBeenCalledTimes(0);
        expect(transformer.transformResult).toHaveBeenCalledTimes(0);
        format(lintReport, formatOptions);
        expect(transformer.transformInput).toHaveBeenCalledTimes(1);
        expect(transformer.transformResult).toHaveBeenCalledTimes(1);
      });
    });
  });
});
