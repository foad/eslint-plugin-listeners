# eslint-plugin-listeners

![Test](https://github.com/foad/eslint-plugin-listeners/workflows/Test/badge.svg)

This project aims to provide formatting rules to prevent memory leaks around event listeners.

## Requirements

- ESLint `>= 8.57`
- Node.js `>= 20`

## Installation

```
$ yarn add --dev eslint eslint-plugin-listeners
```

If you installed ESLint globally (using `-g`) then install `eslint-plugin-listeners` globally too.

## Usage

### Flat config (`eslint.config.js`, ESLint 9+)

Use a shipped preset:

```js
import listeners from 'eslint-plugin-listeners';

export default [
  ...listeners.configs['flat/recommended'],
];
```

Available presets: `flat/recommended`, `flat/strict`.

Or wire rules up manually:

```js
import listeners from 'eslint-plugin-listeners';

export default [
  {
    plugins: { listeners },
    rules: {
      'listeners/no-missing-remove-event-listener': 'error',
      'listeners/matching-remove-event-listener': 'error',
      'listeners/no-inline-function-event-listener': 'error',
    },
  },
];
```

### Legacy config (`.eslintrc`, ESLint 8)

Add `listeners` to the plugins section (the `eslint-plugin-` prefix is optional):

```json
{
  "plugins": ["listeners"]
}
```

Then extend a shipped preset:

```json
{
  "extends": ["plugin:listeners/recommended"]
}
```

Available presets: `recommended`, `strict`.

Or configure the rules directly:

```json
{
  "rules": {
    "listeners/no-missing-remove-event-listener": "error",
    "listeners/matching-remove-event-listener": "error",
    "listeners/no-inline-function-event-listener": "error"
  }
}
```

## Rule Documentation

- [no-missing-remove-event-listener](docs/rules/no-missing-remove-event-listener.md)
- [matching-remove-event-listener](docs/rules/matching-remove-event-listener.md)
- [no-inline-function-event-listener](docs/rules/no-inline-function-event-listener.md)
