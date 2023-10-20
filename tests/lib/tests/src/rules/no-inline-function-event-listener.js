"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = __importDefault(require("mocha"));
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const event_listener_1 = require("../../../src/rules/event-listener");
const utils_1 = require("../../../src/utils");
rule_tester_1.RuleTester.afterAll = mocha_1.default.after;
const ruleTester = new rule_tester_1.RuleTester({
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    parser: '@typescript-eslint/parser',
});
ruleTester.run('inline-function-event-listener', (0, event_listener_1.createRule)(utils_1.RuleType.InlineFunctionEventListener), {
    valid: [
        {
            code: `
      const handleClack = () => {
        console.log('click clack')
      }

      class App {
        handleRootNodeClick = () => {
          console.log('click') // eslint-disable-line no-console
        }

        componentDidMount() {
          this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.addEventListener('clack', handleClickClack)
        }

        componentWillUnmount() {
          this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.removeEventListener('clack', handleClickClack)
        }

        render() {
          return (
            <div ref={node => this.rootNodeRef = node} />
          )
        }
      }
    `,
        },
    ],
    invalid: [
        {
            code: `
        class App {
          handleRootNodeClick = () => {
            console.log('click')
          }

          handleRootNodeTap = () => {
            console.log('click')
          }

          componentDidMount() {
            this.rootNodeRef.addEventListener('click', () => {
              console.log('click')
            })

            this.rootNodeRef.addEventListener('tap', function () {
              console.log('tap')
            })
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
            this.rootNodeRef.removeEventListener('tap', this.handleRootNodeTap)
          }

          render() {
            return (
              <div ref={node => this.rootNodeRef = node} />
            )
          }
        }
      `,
            errors: [
                {
                    messageId: 'prohibitedListener',
                    data: {
                        element: 'this.rootNodeRef',
                        eventName: 'click',
                        type: 'arrow function',
                    },
                },
                {
                    messageId: 'prohibitedListener',
                    data: {
                        element: 'this.rootNodeRef',
                        eventName: 'tap',
                        type: 'plain function',
                    },
                },
            ],
        },
    ],
});
