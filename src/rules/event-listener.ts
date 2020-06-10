import { Rule } from 'eslint';
import { BaseCallExpression, Expression, MemberExpression, Identifier, SimpleLiteral, SourceLocation } from 'estree';

import {
  isNodeMemberExpression,
  isNodeFunctionExpression,
  isNodeArrowFunctionExpression,
  isNodeIdentifier,
  parseMemberExpression,
  RuleType,
  getDescription,
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
      loc: SourceLocation;
    };
  };
}

interface Listeners {
  [ListenerType.ADD_EVENT_LISTENER]?: ListenedElements;
  [ListenerType.REMOVE_EVENT_LISTENER]?: ListenedElements;
}

const reportMissingListener = (context: Rule.RuleContext, element: string, eventName: string, loc: SourceLocation) => {
  context.report({
    loc,
    message: `${eventName} on ${element} does not have ` + 'a corresponding removeEventListener',
  });
};

const reportListenersDoNoMatch = (
  context: Rule.RuleContext,
  element: string,
  eventName: string,
  add: string,
  remove: string,
  loc: SourceLocation
) => {
  context.report({
    loc,
    message: `${add} and ${remove} on ${element} for ${eventName} do not match`,
  });
};

const reportProhibitedListener = (
  context: Rule.RuleContext,
  element: string,
  eventName: string,
  type: string,
  loc: SourceLocation
) => {
  context.report({
    loc,
    message: `event handler for ${eventName} on ${element} is ${type} ` + `${type}s are prohibited as event handlers`,
  });
};

const callExpressionListener = (listeners: Listeners) => (node: BaseCallExpression) => {
  if (isNodeMemberExpression(node.callee)) {
    const callee: MemberExpression = <MemberExpression>node.callee;
    const listenerType = (<Identifier>callee.property)?.name;

    if ([ListenerType.ADD_EVENT_LISTENER, ListenerType.REMOVE_EVENT_LISTENER].includes(<ListenerType>listenerType)) {
      const element = parseMemberExpression(callee);
      const eventName = (<SimpleLiteral>node.arguments[0]).value;
      const handler = <Expression>node.arguments[1];

      let func: string;

      if (isNodeFunctionExpression(handler)) {
        func = PLAIN_FUNCTION;
      } else if (isNodeArrowFunctionExpression(handler)) {
        func = ARROW_FUNCTION;
      } else if (isNodeIdentifier(handler)) {
        func = (<Identifier>handler).name;
      } else {
        func = parseMemberExpression(<MemberExpression>handler);
      }

      const currentTypeListeners = listeners[<ListenerType>listenerType] || {};
      listeners[<ListenerType>listenerType] = {
        ...currentTypeListeners,
        [element]: {
          ...currentTypeListeners[element],
          [<string>eventName]: {
            func,
            loc: node.loc,
          },
        },
      };
    }
  }
};

const programListener = (ruleName: RuleType, listeners: Listeners, context: Rule.RuleContext) => () => {
  const addListeners = listeners[ListenerType.ADD_EVENT_LISTENER] ?? {};
  const removeListeners = listeners[ListenerType.REMOVE_EVENT_LISTENER] ?? {};

  Object.keys(addListeners).forEach((element) => {
    const addEvents = addListeners[element];
    const removeEvents = removeListeners[element];

    Object.entries(addEvents).forEach(([eventName, { func, loc }]) => {
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
          if (removeEvents[eventName].func !== func) {
            reportListenersDoNoMatch(context, element, eventName, func, event.func, loc);
          }
          break;
      }
    });
  });
};

export const createRule = (ruleName: RuleType): Rule.RuleModule => ({
  meta: {
    docs: {
      description: getDescription(ruleName),
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/foad/eslint-plugin-listeners',
    },
    schema: [],
  },
  create: (context: Rule.RuleContext): Rule.RuleListener => {
    const listeners: Listeners = {};

    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'CallExpression:exit': callExpressionListener(listeners),
      'Program:exit': programListener(ruleName, listeners, context),
    };
  },
});
