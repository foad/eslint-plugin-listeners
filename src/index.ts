import { createRule } from './rules/event-listener';

import { RuleType } from './utils';

const rules = {
  'no-missing-remove-event-listener': createRule(RuleType.MissingRemoveEventListener),
  'matching-remove-event-listener': createRule(RuleType.MatchingRemoveEventListener),
  'no-inline-function-event-listener': createRule(RuleType.InlineFunctionEventListener),
};

const ruleSettings = {
  'listeners/no-missing-remove-event-listener': 'error',
  'listeners/matching-remove-event-listener': 'error',
  'listeners/no-inline-function-event-listener': 'error',
};

const plugin = {
  rules,
  configs: {
    recommended: {
      plugins: ['listeners'],
      rules: ruleSettings,
    },
    strict: {
      plugins: ['listeners'],
      rules: ruleSettings,
    },
  },
};

Object.assign(plugin.configs, {
  'flat/recommended': [{ plugins: { listeners: plugin }, rules: ruleSettings }],
  'flat/strict': [{ plugins: { listeners: plugin }, rules: ruleSettings }],
});

export = plugin;
