"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescription = exports.parseMemberExpression = exports.isArgumentIdentifier = exports.isArgumentLiteral = exports.isNodeArrowFunctionExpression = exports.isNodeFunctionExpression = exports.isNodeThisExpression = exports.isNodeMemberExpression = exports.isNodeIdentifier = exports.RuleType = void 0;
var RuleType;
(function (RuleType) {
    RuleType["MissingRemoveEventListener"] = "no-missing-remove-event-listener";
    RuleType["MatchingRemoveEventListener"] = "matching-remove-event-listener";
    RuleType["InlineFunctionEventListener"] = "no-inline-function-event-listener";
})(RuleType || (exports.RuleType = RuleType = {}));
const isNodeIdentifier = (node) => (node === null || node === void 0 ? void 0 : node.type) === 'Identifier';
exports.isNodeIdentifier = isNodeIdentifier;
const isNodeMemberExpression = (node) => (node === null || node === void 0 ? void 0 : node.type) === 'MemberExpression';
exports.isNodeMemberExpression = isNodeMemberExpression;
const isNodeThisExpression = (node) => (node === null || node === void 0 ? void 0 : node.type) === 'ThisExpression';
exports.isNodeThisExpression = isNodeThisExpression;
const isNodeFunctionExpression = (node) => (node === null || node === void 0 ? void 0 : node.type) === 'FunctionExpression';
exports.isNodeFunctionExpression = isNodeFunctionExpression;
const isNodeArrowFunctionExpression = (node) => (node === null || node === void 0 ? void 0 : node.type) === 'ArrowFunctionExpression';
exports.isNodeArrowFunctionExpression = isNodeArrowFunctionExpression;
const isArgumentLiteral = (arg) => (arg === null || arg === void 0 ? void 0 : arg.type) === 'Literal';
exports.isArgumentLiteral = isArgumentLiteral;
const isArgumentIdentifier = (arg) => (arg === null || arg === void 0 ? void 0 : arg.type) === 'Identifier';
exports.isArgumentIdentifier = isArgumentIdentifier;
const parseMemberExpression = (node) => {
    let value;
    if ((0, exports.isNodeIdentifier)(node.object)) {
        value = node.object.name;
    }
    if ((0, exports.isNodeMemberExpression)(node.object)) {
        value = (0, exports.parseMemberExpression)(node.object);
    }
    if ((0, exports.isNodeThisExpression)(node.object)) {
        value = `this.${node.property.name}`;
    }
    return value;
};
exports.parseMemberExpression = parseMemberExpression;
const getDescription = (ruleName) => {
    switch (ruleName) {
        case RuleType.MissingRemoveEventListener:
            return 'No missing removeEventListener if addEventListener exists';
        case RuleType.MatchingRemoveEventListener:
            return 'Handler for removeEventListener should match addEventListener';
        case RuleType.InlineFunctionEventListener:
            return 'Handler for event listener should not be an inline function';
    }
};
exports.getDescription = getDescription;
