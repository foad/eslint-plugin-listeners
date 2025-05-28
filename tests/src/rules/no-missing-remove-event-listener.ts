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

ruleTester.run('no-missing-remove-event-listener', createRule(RuleType.MissingRemoveEventListener), {
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
      emitter.removeListener()
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
