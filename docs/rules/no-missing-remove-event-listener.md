# no-missing-remove-event-listener

## Rule Details

This rule enforces that there be a `removeEventListener` for all events that have an `addEventListener` attached

Examples of **incorrect** code for this rule:

```js
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
```

Examples of **correct** code for this rule:

```js
class App {
  handleRootNodeClick = () => {
    console.log('click')
  }

  componentDidMount() {
    this.rootNodeRef.addEventListener('click', this.handleRootNodeClick)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```