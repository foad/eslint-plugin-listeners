# no-inline-function-event-listener

## Rule Details

This rule enforces that the handlers for `addEventListener` are not inline functions

Examples of **incorrect** code for this rule:

```js
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
```

Examples of **correct** code for this rule:

```js
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
```