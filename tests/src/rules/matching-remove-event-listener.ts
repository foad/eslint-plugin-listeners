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

ruleTester.run('matching-remove-event-listener', createRule(RuleType.MatchingRemoveEventListener), {
  valid: [
    {
      code: `
      const handleClack = () => {
        console.log('click clack')
      }

      class App {
        handleRootNodeClick = () => {
          console.log('click')
        }

        componentDidMount() {
          this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.addEventListener('clack', handleClack)
        }

        componentWillUnmount() {
          this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
          this.rootNodeRef.removeEventListener('clack', handleClack)
        }

        render() {
          return (
            <div ref={node => (this.rootNodeRef = node)} />
          )
        }
      }
    `,
    },
    {
      code: `
      const clickHandler = () => {
        console.log('click')
      }

      const anotherClickHandler = () => {
        console.log('click')
      }

      class App {
        componentDidMount() {
          this.rootNodeRef.addEventListener('click', clickHandler)
          this.rootNodeRef.addEventListener('click', anotherClickHandler)
        }

        componentWillUnmount() {
          this.rootNodeRef.removeEventListener('click', anotherClickHandler)
        }

        render() {
          return (
            <div ref={node => (this.rootNodeRef = node)} />
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
      const data2Handler = () => {
        console.log('data')
      }

      emitter.on('data', dataHandler)
      
      emitter.once('close', () => {
        console.log('close')
        emitter.removeListener('data', dataHandler)
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

          handleRootNodeKeyPress = () => {
            console.log('keyPress')
          }

          componentDidMount() {
            window.addEventListener('click', this.handleRootNodeClick)
          }

          componentWillUnmount() {
            window.removeEventListener('click', this.handleRootNodeKeyPress)
          }

          render() {
            return null
          }
        }
      `,
      errors: [
        {
          messageId: 'listenersDoNotMatch',
          data: {
            add: 'this.handleRootNodeClick',
            remove: 'this.handleRootNodeKeyPress',
            element: 'window',
            eventName: 'click',
          },
        },
      ],
    },
    {
      code: `
        const clickHandler = () => {
          console.log('click')
        }

        const anotherClickHandler = () => {
          console.log('click')
        }

        class App {
          componentDidMount() {
            this.rootNodeRef.addEventListener('click', clickHandler)
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('click', anotherClickHandler)
          }

          render() {
            return (
              <div ref={node => (this.rootNodeRef = node)} />
            )
          }
        }
      `,
      errors: [
        {
          messageId: 'listenersDoNotMatch',
          data: {
            add: 'clickHandler',
            remove: 'anotherClickHandler',
            element: 'this.rootNodeRef',
            eventName: 'click',
          },
        },
      ],
    },
    {
      code: `
        const clickHandler = () => {
          console.log('click')
        }

        class App {
          componentDidMount() {
            this.rootNodeRef.addEventListener('click', clickHandler, true)
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('click', clickHandler)
          }

          render() {
            return (
              <div ref={node => (this.rootNodeRef = node)} />
            )
          }
        }
      `,
      errors: [
        {
          messageId: 'listenersDoNotMatchUseCapture',
          data: {
            remove: 'clickHandler',
            element: 'this.rootNodeRef',
            eventName: 'click',
          },
        },
      ],
    },
    {
      code: `
        const clickHandler = () => {
          console.log('click')
        }

        class App {
          componentDidMount() {
            const useCapture = true;
            this.rootNodeRef.addEventListener('click', clickHandler, useCapture)
          }

          componentWillUnmount() {
            this.rootNodeRef.removeEventListener('click', clickHandler)
          }

          render() {
            return (
              <div ref={node => (this.rootNodeRef = node)} />
            )
          }
        }
      `,
      errors: [
        {
          messageId: 'listenersDoNotMatchUseCapture',
          data: {
            remove: 'clickHandler',
            element: 'this.rootNodeRef',
            eventName: 'click',
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
      const data2Handler = () => {
        console.log('data')
      }

      emitter.on('data', dataHandler)
      
      emitter.once('close', () => {
        console.log('close')
        emitter.removeListener('data', dataHandler2)
      })
      `,
      errors: [
        {
          messageId: 'listenersDoNotMatch',
          data: {
            add: 'dataHandler',
            remove: 'dataHandler2',
            element: 'emitter',
            eventName: 'data',
          },
        },
      ],
    },
  ],
});
