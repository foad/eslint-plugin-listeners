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
ruleTester.run('no-missing-remove-event-listener', (0, event_listener_1.createRule)(utils_1.RuleType.MissingRemoveEventListener), {
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
        this.rootNodeRef.addEventListener('click', this.handleRootNodeClick, { once: true })
        this.rootNodeRef.addEventListener('clack', handleClickClack, { once: true })
      }

      render() {
        return (
          <div ref={node => this.rootNodeRef = node} />
        )
      }
    }
    `,
        },
        {
            code: `
      const emitter = new EventEmitter()

      const dataHandler = () => {
        console.log('data')
      }

      emitter.on('data', dataHandler)
      
      emitter.once('close', () => {
        console.log('close')
        emitter.off('data', dataHandler)
      })
      `,
        },
        {
            code: `
      const emitter = new EventEmitter()

      const dataHandler = () => {
        console.log('data')
      }

      emitter.on('data', dataHandler)
      
      emitter.once('close', () => {
        console.log('close')
        emitter.removeAllListeners()
      })
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

          componentDidMount() {
            this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
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
                    messageId: 'missingRemoveEventListener',
                    data: {
                        eventName: 'click',
                        element: 'this.rootNodeRef',
                    },
                },
            ],
        },
        {
            code: `
        class App {
          handleRootNodeClick = () => {
            console.log('click')
          }

          handleRootNodeKeyPress = () => {
            console.log('keyPress')
          }

          componentDidMount() {
            this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('keypress', this.handleRootNodeKeyPress)
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
                    messageId: 'missingRemoveEventListener',
                    data: {
                        eventName: 'click',
                        element: 'this.rootNodeRef',
                    },
                },
            ],
        },
        {
            code: `
        class App {
          handleRootNodeClick = () => {
            console.log('click')
          }

          componentDidMount() {
            this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('keypress', this.handleRootNodeClick)
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
                    messageId: 'missingRemoveEventListener',
                    data: {
                        eventName: 'click',
                        element: 'this.rootNodeRef',
                    },
                },
            ],
        },
        {
            code: `
      const emitter = new EventEmitter()

      const dataHandler = () => {
        console.log('data')
      }

      emitter.on('data', dataHandler)
      
      emitter.once('close', () => {
        console.log('close')
      })
      `,
            errors: [
                {
                    messageId: 'missingRemoveEventListener',
                    data: {
                        eventName: 'data',
                        element: 'emitter',
                    },
                },
            ],
        },
    ],
});
