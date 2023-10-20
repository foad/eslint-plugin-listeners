import mocha from 'mocha';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { createRule } from '../../../src/rules/event-listener';
import { RuleType } from '../../../src/utils';

RuleTester.afterAll = mocha.after;
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('inline-function-event-listener', createRule(RuleType.InlineFunctionEventListener), {
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
