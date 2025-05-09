# no-inline-function-event-listener

## Rule Details

This rule enforces that the handlers for `addEventListener` are not inline functions

EventEmitters with `addListener` and `removeListener` are also supported. If the `removeAllListeners` function is called, a matching
`removeListener` is not required. The `on` and `off` alias are also supported.

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

```js
const handleData = () => {
  console.log('some data')
}

class Handler {
  constructor(private readonly emitter: EventEmitter) {
    emitter.on('data', handleData)
    emitter.on('error', (error) => {
      console.log('some error', error)
    })
  }

  destroy() {
    this.emitter.removeAllListeners()
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
    this.rootNodeRef.addEventListener('clack', handleClack)
  }

  componentWillUnmount() {
    this.rootNodeRef.removeEventListener('click', this.handleRootNodeClick)
    this.rootNodeRef.removeEventListener('clack', handleClack)
  }

  render() {
    return (
      <div ref={node => this.rootNodeRef = node} />
    )
  }
}
```

```js
const handleData = () => {
  console.log('some data')
}
const handleError = (error) => {
  console.log('some error', error)
}

class Handler {
  constructor(private readonly emitter: EventEmitter) {
    emitter.on('data', handleData)
    emitter.on('error', handleError)
  }

  destroy() {
    this.emitter.off('data', handleData)
    this.emitter.off('error', handleError)       
  }
}
```
