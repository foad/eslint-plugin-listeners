# matching-remove-event-listener

## Rule Details

This rule enforces that the handler for a `removeEventListener` is the same handler that was passed in to the associated `addEventListener`

Examples of **incorrect** code for this rule:

```js
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
```

Examples of **correct** code for this rule:

```js
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
    window.removeEventListener('click', this.handleRootNodeClick)
  }

  render() {
    return null
  }
}
```