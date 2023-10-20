"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
const utils_1 = require("../utils");
var ListenerType;
(function (ListenerType) {
    ListenerType["ADD_EVENT_LISTENER"] = "addEventListener";
    ListenerType["REMOVE_EVENT_LISTENER"] = "removeEventListener";
})(ListenerType || (ListenerType = {}));
const PLAIN_FUNCTION = 'plain function';
const ARROW_FUNCTION = 'arrow function';
const isProhibitedHandler = (type) => type === PLAIN_FUNCTION || type === ARROW_FUNCTION;
const reportMissingListener = (context, element, eventName, loc) => {
    context.report({
        loc,
        messageId: 'missingRemoveEventListener',
        data: {
            eventName,
            element,
        },
    });
};
const reportListenersDoNoMatch = (context, element, eventName, add, remove, loc, isUseCapture) => {
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
const reportProhibitedListener = (context, element, eventName, type, loc) => {
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
const callExpressionListener = (listeners) => (node) => {
    var _a, _b, _c;
    if ((0, utils_1.isNodeMemberExpression)(node.callee)) {
        const callee = node.callee;
        const listenerType = (_a = callee.property) === null || _a === void 0 ? void 0 : _a.name;
        if ([ListenerType.ADD_EVENT_LISTENER, ListenerType.REMOVE_EVENT_LISTENER].includes(listenerType)) {
            const element = (0, utils_1.parseMemberExpression)(callee);
            const eventName = node.arguments[0].value;
            const handler = node.arguments[1];
            if (listenerType === ListenerType.ADD_EVENT_LISTENER) {
                const params = (_c = (_b = node.arguments) === null || _b === void 0 ? void 0 : _b[2]) === null || _c === void 0 ? void 0 : _c.properties;
                if (params && params.length) {
                    const isOnce = params.some((param) => param.key.name === 'once' && param.value.value);
                    if (isOnce) {
                        return;
                    }
                }
            }
            let func;
            if ((0, utils_1.isNodeFunctionExpression)(handler)) {
                func = PLAIN_FUNCTION;
            }
            else if ((0, utils_1.isNodeArrowFunctionExpression)(handler)) {
                func = ARROW_FUNCTION;
            }
            else if ((0, utils_1.isNodeIdentifier)(handler)) {
                func = handler.name;
            }
            else {
                func = (0, utils_1.parseMemberExpression)(handler);
            }
            const currentTypeListeners = listeners[listenerType] || {};
            listeners[listenerType] = Object.assign(Object.assign({}, currentTypeListeners), { [element]: Object.assign(Object.assign({}, currentTypeListeners[element]), { [eventName]: {
                        func,
                        loc: node.loc,
                        hasUseCapture: (0, utils_1.isArgumentLiteral)(node.arguments[2]) || (0, utils_1.isArgumentIdentifier)(node.arguments[2]),
                    } }) });
        }
    }
};
const programListener = (ruleName, listeners, context) => () => {
    var _a, _b;
    const addListeners = (_a = listeners[ListenerType.ADD_EVENT_LISTENER]) !== null && _a !== void 0 ? _a : {};
    const removeListeners = (_b = listeners[ListenerType.REMOVE_EVENT_LISTENER]) !== null && _b !== void 0 ? _b : {};
    Object.keys(addListeners).forEach((element) => {
        const addEvents = addListeners[element];
        const removeEvents = removeListeners[element];
        Object.entries(addEvents).forEach(([eventName, { func, loc, hasUseCapture }]) => {
            const event = removeEvents === null || removeEvents === void 0 ? void 0 : removeEvents[eventName];
            switch (ruleName) {
                case utils_1.RuleType.MissingRemoveEventListener:
                    if (!event) {
                        reportMissingListener(context, element, eventName, loc);
                    }
                    break;
                case utils_1.RuleType.InlineFunctionEventListener:
                    if (isProhibitedHandler(func)) {
                        reportProhibitedListener(context, element, eventName, func, loc);
                    }
                    break;
                case utils_1.RuleType.MatchingRemoveEventListener:
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
const createRule = (ruleName) => ({
    meta: {
        type: 'problem',
        docs: {
            description: (0, utils_1.getDescription)(ruleName),
            recommended: 'recommended',
            url: 'https://github.com/foad/eslint-plugin-listeners',
        },
        messages: {
            missingRemoveEventListener: '{{eventName}} on {{element}} does not have a corresponding removeEventListener',
            listenersDoNotMatch: '{{add}} and {{remove}} on {{element}} for {{eventName}} do not match',
            listenersDoNotMatchUseCapture: 'removeEventListener {{remove}} on {{element}} for {{eventName}} is missing useCapture parameter',
            prohibitedListener: 'event handler for {{eventName}} on {{element}} is {{type}}, {{type}}s are prohibited as event handlers',
        },
        schema: [],
    },
    create: (context) => {
        const listeners = {};
        return {
            'CallExpression:exit': callExpressionListener(listeners),
            'Program:exit': programListener(ruleName, listeners, context),
        };
    },
    defaultOptions: [],
});
exports.createRule = createRule;
