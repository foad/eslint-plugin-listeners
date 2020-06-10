const { RuleTester } = require('eslint');
const createRule = require('../../../lib/rules/event-listener').createRule;
const RuleType = require('../../../lib/utils').RuleType;

const ruleTester = new RuleTester({
  parser: require.resolve("babel-eslint"),
});

ruleTester.run('inline-function-event-listener', createRule(RuleType.InlineFunctionEventListener), {
  valid: [{
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
  }],
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
          message: 'event handler for click on this.rootNodeRef is arrow function ' +
            'arrow functions are prohibited as event handlers',
        },
        {
          message: 'event handler for tap on this.rootNodeRef is plain function ' +
            'plain functions are prohibited as event handlers',
        },
      ],
    },
  ],
});
