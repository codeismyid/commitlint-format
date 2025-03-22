<div align="center">
  
# commitlint-format

Variative and customizable format for [commitlint](https://commitlint.js.org/).

[![License](https://img.shields.io/github/license/codeismyid/commitlint-format?style=flat-square&color=blue)](/LICENSE)
[![NPM Latest](https://img.shields.io/npm/v/commitlint-format.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/commitlint-format)
[![NPM Downloads](https://img.shields.io/npm/dt/commitlint-format.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/commitlint-format)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/commitlint-format?style=flat-square&color=blue)](https://bundlephobia.com/package/commitlint-format)

[![CI](https://img.shields.io/github/actions/workflow/status/codeismyid/commitlint-format/ci.yaml?style=flat-square&logo=github&label=CI&labelColor=383f47)](https://github.com/codeismyid/commitlint-format/actions/workflows/ci.yaml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/codeismyid/commitlint-format/codeql.yaml?style=flat-square&logo=github&label=CodeQL&labelColor=383f47)](https://github.com/codeismyid/commitlint-format/actions/workflows/codeql.yaml)
[![Codecov](https://img.shields.io/codecov/c/github/codeismyid/commitlint-format?style=flat-square&logo=codecov&label=Coverage&labelColor=383f47)](https://app.codecov.io/github/codeismyid/commitlint-format)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?style=flat-square&logo=typescript&label=Coverage&labelColor=383f47&color=44cc11&prefix=≥&suffix=%&query=$.typeCoverage.atLeast&uri=https://github.com/codeismyid/commitlint-format/raw/main/package.json)](https://github.com/codeismyid/commitlint-format)

</div>

## 🌟 Highlight

- **Variative format output.**
  <details>
    <summary>Default</summary>

    ```txt
    ✉️ Commit Message

    commit message here

    ✔ all good [no-problem-found]

    ✔ Summary: found 0 errors and 0 warnings.

    --------------------------------------

    ✉️ Commit Message

    commit message here

    ⚠ warning message [rule-name]

    ⚠ Summary: found 0 errors and 1 warnings.

    Help: help-url-here

    --------------------------------------

    ✉️ Commit Message

    commit message here

    ✖ error message [rule-name]

    ✖ Summary: found 1 errors and 0 warnings.

    Help: help-url-here

    --------------------------------------

    ✖ Lint 3 commits. Found 1 errors and 1 warnings.
    ```
  </details>
  <details>
    <summary>
      Standard / @commitlint (Based on <a href="https://www.npmjs.com/package/@commitlint/format">@commitlint/format</a>)
    </summary>

    ```txt
    ⧗   input: commit message here
    ✔   found 0 problems, 0 warnings
    ⧗   input: commit message here
    ⚠   warning message [rule-name]

    ⚠   found 0 problems, 1 warnings
    ⓘ   Get help: help-url-here

    ⧗   input: commit message here
    ✖   error message [rule-name]

    ✖   found 1 problems, 0 warnings
    ⓘ   Get help: help-url-here
    ```
  </details>
  <details>
    <summary>JSON Pretty</summary>

    ```jsonc
    [
      {
        "input": "commit message here",
        "problems": [],
        "summary": {
          "sign": "✔",
          "errorCount": 0,
          "warningCount": 0
        },
        "helpUrl": "https://github.com/conventional-changelog/commitlint/#what-is-commitlint"
      },
      {
        "input": "commit message here",
        "problems": [
          {
            "level": 1,
            "message": "warning message",
            "name": "rule-name",
            "valid": true,
            "sign": "⚠"
          }
        ],
        "summary": {
          "sign": "⚠",
          "errorCount": 0,
          "warningCount": 1
        },
        "helpUrl": "https://github.com/conventional-changelog/commitlint/#what-is-commitlint"
      },
      {
        "input": "commit message here",
        "problems": [
          {
            "level": 2,
            "message": "error message",
            "name": "rule-name",
            "valid": false,
            "sign": "✖"
          }
        ],
        "summary": {
          "sign": "✖",
          "errorCount": 1,
          "warningCount": 0
        },
        "helpUrl": "https://github.com/conventional-changelog/commitlint/#what-is-commitlint"
      }
    ]
    ```
  </details>
  <details>
    <summary>JSON</summary>

    ```jsonc
    [{"input":"commit message here","problems":[],"summary":{"sign":"✔","errorCount":0,"warningCount":0},"helpUrl":"https://github.com/conventional-changelog/commitlint/#what-is-commitlint"},{"input":"commit message here","problems":[{"level":1,"message":"warning message","name":"rule-name","valid":true,"sign":"⚠"}],"summary":{"sign":"⚠","errorCount":0,"warningCount":1},"helpUrl":"https://github.com/conventional-changelog/commitlint/#what-is-commitlint"},{"input":"commit message here","problems":[{"level":2,"message":"error message","name":"rule-name","valid":false,"sign":"✖"}],"summary":{"sign":"✖","errorCount":1,"warningCount":0},"helpUrl":"https://github.com/conventional-changelog/commitlint/#what-is-commitlint"}]
    ```
  </details>
  <details>
    <summary>Github Actions Annotations</summary>

    ```txt
    ::debug::✉️ Commit Message%0A%0Acommit message here%0A%0A✔ all good [no-problem-found]%0A%0A✔ Summary: found 0 errors and 0 warnings.
    ::warning::✉️ Commit Message%0A%0Acommit message here%0A%0A⚠ warning message [rule-name]%0A%0A⚠ Summary: found 0 errors and 1 warnings.%0A%0AHelp: https://github.com/conventional-changelog/commitlint/#what-is-commitlint.
    ::error::✉️ Commit Message%0A%0Acommit message here%0A%0A✖ error message [rule-name]%0A%0A✖ Summary: found 1 errors and 0 warnings.%0A%0AHelp: https://github.com/conventional-changelog/commitlint/#what-is-commitlint.
    ```
  </details>
  <details>
    <summary>Custom</summary>
    
      See [custom formatter usage](#custom-formatter).
  </details>
- **Customizable format options.**
- **Fully typed with typescript.**
- **Well tested.**

## 🔌 Installation

Follow [@commitlint installation](https://commitlint.js.org/guides/getting-started.html) instruction first, and then

```bash
# NPM
npm install --save-dev commitlint-format

# BUN
bun add -d commitlint-format
```

## ⌨️ Usage

Add `commitlint-format` or `commitlint-format/*formatter` to `formatter` field inside commitlint [configuration](https://commitlint.js.org/reference/configuration.html).

Available *formatter:
- @commitlint
- custom
- default
- gha-annotation
- json-pretty
- json
- standard (same as @commitlint)

### Basic Formatting

```jsonc
// .commitlintrc.json
{
  "formatter": "commitlint-format"
}
```

It will use `default` formatter and has the same result as `commitlint-format/default`.

### Customize Formatting

> To make it simple, use javascript or typescript commitlint [configuration](https://commitlint.js.org/reference/configuration.html).

#### Custom Options

```js
// commitlint.config.js
import { formatter } from 'commitlint-format/default';

formatter.setFormatOptions({
  color: false,
  verbose: true
});

export default {
  formatter: 'commitlint-format/default'
};
```

Available format options: 

```ts
type FormatOptions = {
  /**
   * Color the output.
   */
  color?: boolean;

  /**
   * Signs to use as decoration for messages with severity 0, 1, 2.
   */
  signs?: readonly [string, string, string];

  /**
   * Colors to use for messages with severity 0, 1, 2.
   */
  colors?: readonly [string, string, string];

  /**
   * Print summary and inputs for reports without problems.
   */
  verbose?: boolean;

  /**
   * URL to print as help for reports with problems.
   */
  helpUrl?: string;

  /**
   * Prefix to be used for formatted report.
   * Only affects `format` method.
   */
  prefix?: string;

  /**
   * Suffix to be used for formatted report.
   * Only affects `format` method.
   */
  suffix?: string;

  /**
   * Prefix to be used each formatted commit result in the report.
   * Only affects `format` method.
   */
  eachCommitPrefix?: string;

  /**
   * Suffix to be used each formatted commit result in the report (added before separatorBetweenCommits text). 
   * Only affects `format` method. 
   */
  eachCommitSuffix?: string;

  /**
   * Separator to be used between each commit in the report.
   * Only affects `format` method.
   * Defaults to `\n`.
   */
  separatorBetweenCommits?: string;

  /**
   * Separator to be used between formatted input and formatted result.
   * Only affects `format` method and if `formatInput` not resulting empty.
   * Defaults to `\n`.
   */
  separatorBetweenInputAndResult?: string;
  
  /**
   * Finalizing result.
   * Only for `format` method.
   */
  finalizeFormatResult?: (
    formatted: string,
    context: {
      /** Options used for formatting. */
      formatOptions: FormatOptions;
      /** The `chalk` instance used for styling the output. */
      chalk: ChalkInstance;
      /** Whether formatting with verbose or not */
      verbose: boolean;
      /** A function that retrieves the appropriate sign (e.g., ✔, ⚠, ✖) based on the linting level. */
      getSign: (level: 0 | 1 | 2) => string;
    },
    summary: {
      totalCommit: number;
      totalError: number;
      totalWarning: number;
    }
  ) => string
}
```

#### Custom Formatter

The simplest way is by leveraging `commitlint-format/custom`, the only customizable formatter.

```js
// commitlint.config.js
import { formatter } from 'commitlint-format/custom';

formatter.setTransformer({
  /** Function to transform the input (commit message) of the linting result. */
  transformInput: (result, context) => {
    // add transform input logic here..
    return [];
  },
  /** Function to transform the final linting result output. */
  transformResult: (result, context) => {
    // add transform result logic here..
    return [];
  }
});

export default {
  formatter: 'commitlint-format/custom'
};
```

or by creating new formatter instance.

```js
// custom-format.js
import { Blueprint } from 'commitlint-format';
import { Chalk } from 'chalk';

const formatter = new Blueprint.Formatter(
  {
    /** Function to transform the input (commit message) of the linting result. */
    transformInput: (result, context) => {
      // add transform input logic here..
      return [];
    },
    /** Function to transform the final linting result output. */
    transformResult: (result, context) => {
      // add transform result logic here..
      return [];
    }
  },
  new Chalk(), 
  { 
    customizable: true,
    formatOptions: {
      signs: ['.', '?', '!']
    }
  }
);

export default formatter.format;
```

and use it in commitlint [configuration](https://commitlint.js.org/reference/configuration.html).

```jsonc
// .commitlintrc.json
{
  "formatter": "./custom-format.js"
}
```

## ⛏️ Developed With

- [Typescript](https://www.typescriptlang.org/) - Strongly typed programming language that builds on JavaScript.
- [Bun](https://bun.sh/) - All-in-one JavaScript runtime & toolkit designed for speed, complete with a bundler, test runner, and Node.js-compatible package manager.


## 📃 License

The code in this project is released under the [MIT License](LICENSE).