const { RuleTester } = require('eslint');
const createRule = require('../../../lib/rules/event-listener').createRule;
const RuleType = require('../../../lib/utils').RuleType;

const ruleTester = new RuleTester({
  parser: require.resolve("babel-eslint"),
});

ruleTester.run('no-missing-remove-event-listener', createRule(RuleType.MissingRemoveEventListener), {
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
      errors: [{
        message: 'click on this.rootNodeRef does not have a corresponding removeEventListener',
      }],
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
      errors: [{
        message: 'click on this.rootNodeRef does not have a corresponding removeEventListener',
      }],
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
      errors: [{
        message: 'click on this.rootNodeRef does not have a corresponding removeEventListener',
      }],
    },
  ],
})
