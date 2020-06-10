# eslint-plugin-listeners

This project aims to provide formatting rules to prevent memory leaks around event listeners

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ yarn add eslint --dev
```

Next, install `eslint-plugin-listeners`:

```
$ yarn add eslint-plugin-listeners --dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-listeners` globally.

## Usage

Add `listeners` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["listeners"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "listeners/no-missing-remove-event-listener": "error",
    "listeners/matching-remove-event-listener": "error",
    "listeners/no-inline-function-event-listener": "error"
  }
}
```

_or_

You can use our "recommended" settings which enables most of the rules for you

```json
{
  "extends": ["plugin:listeners/recommended"]
}
```

We also support a "strict" settings which enabled all of the rules for you

```json
{
  "extends": ["plugin:listeners/strict"]
}
```

## Rule Documentation

- [no-missing-remove-event-listener](docs/rules/no-missing-remove-event-listener.md)
- [matching-remove-event-listener](docs/rules/matching-remove-event-listener.md)
- [no-inline-function-event-listener](docs/rules/inline-function-event-listener.md)

## Credits

This package is based off of https://github.com/tipsi/eslint-plugin-tipsi