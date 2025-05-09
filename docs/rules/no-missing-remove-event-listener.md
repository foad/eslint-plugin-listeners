# no-missing-remove-event-listener

## Rule Details

This rule enforces that there be a `removeEventListener` for all events that have an `addEventListener` attached

EventEmitters with `addListener` and `removeListener` are also supported. If the `removeAllListeners` function is called, a matching
`removeListener` is not required. The `on` and `off` alias are also supported.

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

```js
const emitter = new EventEmitter()

const dataHandler = () => {
  console.log('data')
}

emitter.on('data', dataHandler)

emitter.once('close', () => {
  console.log('close')
})
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

```js
const emitter = new EventEmitter()

const dataHandler = () => {
  console.log('data')
}

emitter.on('data', dataHandler)

emitter.once('close', () => {
  console.log('close')
  emitter.off('data', dataHandler)
})
```
