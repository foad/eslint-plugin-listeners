# matching-remove-event-listener

## Rule Details

This rule enforces that the handler for a `removeEventListener` is the same handler that was passed in to the associated `addEventListener`

Note that if the `addListener` specifies the `useCapture` argument, so must the `removeEventListener` for it to match and be removed as expected

Examples of **incorrect** code for this rule:

```js
class App {
  handleRootNodeClick = () => {
    console.log('click');
  };

  handleRootNodeKeyPress = () => {
    console.log('keyPress');
  };

  componentDidMount() {
    window.addEventListener('click', this.handleRootNodeClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleRootNodeKeyPress);
  }

  render() {
    return null;
  }
}
```

```js
class App {
  handleRootNodeClick = () => {
    console.log('click');
  };

  componentDidMount() {
    window.addEventListener('click', this.handleRootNodeClick, true);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleRootNodeClick);
  }

  render() {
    return null;
  }
}
```

Examples of **correct** code for this rule:

```js
class App {
  handleRootNodeClick = () => {
    console.log('click');
  };

  handleRootNodeKeyPress = () => {
    console.log('keyPress');
  };

  componentDidMount() {
    window.addEventListener('click', this.handleRootNodeClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleRootNodeClick);
  }

  render() {
    return null;
  }
}
```

```js
class App {
  handleRootNodeClick = () => {
    console.log('click');
  };

  componentDidMount() {
    window.addEventListener('click', this.handleRootNodeClick, true);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleRootNodeClick, true);
  }

  render() {
    return null;
  }
}
```
