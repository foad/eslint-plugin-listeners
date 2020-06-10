import { createRule } from './rules/event-listener';

import { RuleType } from './utils';

module.exports = {
  rules: {
    'no-missing-remove-event-listener': createRule(RuleType.MissingRemoveEventListener),
    'matching-remove-event-listener': createRule(RuleType.MatchingRemoveEventListener),
    'no-inline-function-event-listener': createRule(RuleType.InlineFunctionEventListener),
  },
  configs: {
    recommended: {
      plugins: ['listeners'],
      rules: {
        'listeners/no-missing-remove-event-listener': 'error',
        'listeners/matching-remove-event-listener': 'error',
        'listeners/no-inline-function-event-listener': 'error',
      },
    },
    strict: {
      plugins: ['listeners'],
      rules: {
        'listeners/no-missing-remove-event-listener': 'error',
        'listeners/matching-remove-event-listener': 'error',
        'listeners/no-inline-function-event-listener': 'error',
      },
    },
  },
};
