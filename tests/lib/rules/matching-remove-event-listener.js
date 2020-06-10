const { RuleTester } = require('eslint');
const createRule = require('../../../lib/rules/event-listener').createRule;
const RuleType = require('../../../lib/utils').RuleType;

const ruleTester = new RuleTester({
  parser: require.resolve("babel-eslint"),
});

ruleTester.run('matching-remove-event-listener', createRule(RuleType.MatchingRemoveEventListener), {
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
      errors: [{
        message: 'this.handleRootNodeClick and this.handleRootNodeKeyPress ' +
          'on window for click do not match',
      }],
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
              <div ref={node => this.rootNodeRef = node} />
            )
          }
        }
      `,
      errors: [{
        message: 'clickHandler and anotherClickHandler on this.rootNodeRef for click do not match',
      }],
    },
  ],
});
