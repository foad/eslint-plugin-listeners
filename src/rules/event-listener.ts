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
  ADD_LISTENER = 'addListener',
  REMOVE_LISTENER = 'removeListener',
  REMOVE_ALL_LISTENERS = 'removeAllListeners',
  ON_LISTENER = 'on',
  OFF_LISTENER = 'off',
}

const ADD_LISTENERS = [ListenerType.ADD_EVENT_LISTENER, ListenerType.ADD_LISTENER, ListenerType.ON_LISTENER];
type ADD_LISTENERS_TYPE = (typeof ADD_LISTENERS)[number];
const REMOVE_LISTENERS = [ListenerType.REMOVE_EVENT_LISTENER, ListenerType.REMOVE_LISTENER, ListenerType.OFF_LISTENER];
type REMOVE_LISTENERS_TYPE = (typeof REMOVE_LISTENERS)[number];

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

type Listeners = {
  [key in ADD_LISTENERS_TYPE | REMOVE_LISTENERS_TYPE | ListenerType.REMOVE_ALL_LISTENERS]?: ListenedElements;
};

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

    if ([...ADD_LISTENERS, ...REMOVE_LISTENERS, ListenerType.REMOVE_ALL_LISTENERS].includes(listenerType)) {
      const element = parseMemberExpression(callee);
      const eventName =
        ListenerType.REMOVE_ALL_LISTENERS !== listenerType
          ? (<TSESTree.Literal | undefined>node.arguments?.[0])?.value
          : '_all_';
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

      if (!eventName) {
        return;
      }

      let func: string;

      if (isNodeFunctionExpression(handler)) {
        func = PLAIN_FUNCTION;
      } else if (isNodeArrowFunctionExpression(handler)) {
        func = ARROW_FUNCTION;
      } else if (isNodeIdentifier(handler)) {
        func = (<TSESTree.Identifier>handler).name;
      } else if (handler) {
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
    const addListenersPre = ADD_LISTENERS.map((listenerName) => listeners[listenerName] ?? {});
    const addListeners: ListenedElements = Object.assign({}, ...addListenersPre);
    const removeListenersPre = REMOVE_LISTENERS.map((listerName) => listeners[listerName] ?? {});
    const removeListeners: ListenedElements = Object.assign({}, ...removeListenersPre);
    const removeAllListeners = listeners[ListenerType.REMOVE_ALL_LISTENERS] ?? {};

    Object.keys(addListeners).forEach((element) => {
      const addEvents = addListeners[element];
      const removeEvents = removeListeners[element];
      const removeAllEvents = removeAllListeners[element];
      Object.entries(addEvents).forEach(([eventName, { func, loc, hasUseCapture }]) => {
        const event = removeEvents?.[eventName] ?? removeAllEvents?.[0];
        switch (ruleName) {
          case RuleType.MissingRemoveEventListener:
            if (!event) {
              reportMissingListener(context, element, eventName, loc);
            }
            break;

          case RuleType.InlineFunctionEventListener:
            if (isProhibitedHandler(func) && (!event || event.func !== undefined)) {
              reportProhibitedListener(context, element, eventName, func, loc);
            }
            break;

          case RuleType.MatchingRemoveEventListener:
            if (event && event.func !== func && event.func !== undefined) {
              reportListenersDoNoMatch(context, element, eventName, func, event.func, loc, false);
            }
            if (event && event.func === func && hasUseCapture && !event.hasUseCapture && event.func !== undefined) {
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
