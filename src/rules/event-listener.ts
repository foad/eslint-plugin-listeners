import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  isNodeMemberExpression,
  isNodeFunctionExpression,
  isNodeArrowFunctionExpression,
  isNodeIdentifier,
  parseMemberExpression,
  RuleType,
  getDescription,
  isArgumentLiteral,
  isArgumentIdentifier,
} from '../utils';

enum ListenerType {
  ADD_EVENT_LISTENER = 'addEventListener',
  REMOVE_EVENT_LISTENER = 'removeEventListener',
}

const PLAIN_FUNCTION = 'plain function';
const ARROW_FUNCTION = 'arrow function';

const isProhibitedHandler = (type: string) => type === PLAIN_FUNCTION || type === ARROW_FUNCTION;

interface ListenedElements {
  [key: string]: {
    [key: string]: {
      func: string;
      loc: TSESTree.SourceLocation;
      isOnce?: boolean;
      hasUseCapture?: boolean;
    };
  };
}

interface Listeners {
  [ListenerType.ADD_EVENT_LISTENER]?: ListenedElements;
  [ListenerType.REMOVE_EVENT_LISTENER]?: ListenedElements;
}

interface HandlerParameters {
  properties: {
    key: {
      name: string;
    };
    value: {
      value: boolean;
    };
  }[];
}

const reportMissingListener = (
  context: TSESLint.RuleContext<string, Array<unknown>>,
  element: string,
  eventName: string,
  loc: TSESTree.SourceLocation
) => {
  context.report({
    loc,
    messageId: 'missingRemoveEventListener',
    data: {
      eventName,
      element,
    },
  });
};

const reportListenersDoNoMatch = (
  context: TSESLint.RuleContext<string, unknown[]>,
  element: string,
  eventName: string,
  add: string,
  remove: string,
  loc: TSESTree.SourceLocation,
  isUseCapture: boolean
) => {
  if (isUseCapture) {
    return context.report({
      loc,
      messageId: 'listenersDoNotMatchUseCapture',
      data: {
        remove,
        element,
        eventName,
      },
    });
  }
  context.report({
    loc,
    messageId: 'listenersDoNotMatch',
    data: {
      eventName,
      element,
      add,
      remove,
    },
  });
};

const reportProhibitedListener = (
  context: TSESLint.RuleContext<string, unknown[]>,
  element: string,
  eventName: string,
  type: string,
  loc: TSESTree.SourceLocation
) => {
  context.report({
    loc,
    messageId: 'prohibitedListener',
    data: {
      eventName,
      element,
      type,
    },
  });
};

const callExpressionListener = (listeners: Listeners) => (node: TSESTree.CallExpression) => {
  if (isNodeMemberExpression(node.callee)) {
    const callee: TSESTree.MemberExpression = <TSESTree.MemberExpression>node.callee;
    const listenerType = (<TSESTree.Identifier>callee.property)?.name as ListenerType;

    if ([ListenerType.ADD_EVENT_LISTENER, ListenerType.REMOVE_EVENT_LISTENER].includes(listenerType)) {
      const element = parseMemberExpression(callee);
      const eventName = (<TSESTree.Literal>node.arguments[0]).value;
      const handler = <TSESTree.Expression>node.arguments[1];

      if (listenerType === ListenerType.ADD_EVENT_LISTENER) {
        const params = (node.arguments?.[2] as HandlerParameters)?.properties;
        if (params && params.length) {
          const isOnce = params.some((param) => param.key.name === 'once' && param.value.value);
          if (isOnce) {
            return;
          }
        }
      }

      let func: string;

      if (isNodeFunctionExpression(handler)) {
        func = PLAIN_FUNCTION;
      } else if (isNodeArrowFunctionExpression(handler)) {
        func = ARROW_FUNCTION;
      } else if (isNodeIdentifier(handler)) {
        func = (<TSESTree.Identifier>handler).name;
      } else {
        func = parseMemberExpression(<TSESTree.MemberExpression>handler);
      }

      const currentTypeListeners = listeners[<ListenerType>listenerType] || {};
      listeners[<ListenerType>listenerType] = {
        ...currentTypeListeners,
        [element]: {
          ...currentTypeListeners[element],
          [<string>eventName]: {
            func,
            loc: node.loc,
            hasUseCapture: isArgumentLiteral(node.arguments[2]) || isArgumentIdentifier(node.arguments[2]),
          },
        },
      };
    }
  }
};

const programListener =
  (ruleName: RuleType, listeners: Listeners, context: TSESLint.RuleContext<string, unknown[]>) => () => {
    const addListeners = listeners[ListenerType.ADD_EVENT_LISTENER] ?? {};
    const removeListeners = listeners[ListenerType.REMOVE_EVENT_LISTENER] ?? {};

    Object.keys(addListeners).forEach((element) => {
      const addEvents = addListeners[element];
      const removeEvents = removeListeners[element];

      Object.entries(addEvents).forEach(([eventName, { func, loc, hasUseCapture }]) => {
        const event = removeEvents?.[eventName];

        switch (ruleName) {
          case RuleType.MissingRemoveEventListener:
            if (!event) {
              reportMissingListener(context, element, eventName, loc);
            }
            break;

          case RuleType.InlineFunctionEventListener:
            if (isProhibitedHandler(func)) {
              reportProhibitedListener(context, element, eventName, func, loc);
            }
            break;

          case RuleType.MatchingRemoveEventListener:
            if (event && event.func !== func) {
              reportListenersDoNoMatch(context, element, eventName, func, event.func, loc, false);
            }
            if (event && event.func === func && hasUseCapture && !event.hasUseCapture) {
              reportListenersDoNoMatch(context, element, eventName, func, event.func, loc, hasUseCapture);
            }
            break;
        }
      });
    });
  };

export const createRule = (ruleName: RuleType): TSESLint.RuleModule<string, unknown[]> => ({
  meta: {
    type: 'problem',
    docs: {
      description: getDescription(ruleName),
      recommended: 'recommended',
      url: 'https://github.com/foad/eslint-plugin-listeners',
    },
    messages: {
      missingRemoveEventListener: '{{eventName}} on {{element}} does not have a corresponding removeEventListener',
      listenersDoNotMatch: '{{add}} and {{remove}} on {{element}} for {{eventName}} do not match',
      listenersDoNotMatchUseCapture:
        'removeEventListener {{remove}} on {{element}} for {{eventName}} is missing useCapture parameter',
      prohibitedListener:
        'event handler for {{eventName}} on {{element}} is {{type}}, {{type}}s are prohibited as event handlers',
    },
    schema: [],
  },
  create: (context: TSESLint.RuleContext<string, unknown[]>): TSESLint.RuleListener => {
    const listeners: Listeners = {};

    return {
      'CallExpression:exit': callExpressionListener(listeners),
      'Program:exit': programListener(ruleName, listeners, context),
    };
  },
  defaultOptions: [],
});
