# Thunder State

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Complex state management made easy.

Your work environment should be as easy as possible, so simple tasks don't require excessive work or a monstrous learning curve.  To help maintain your workflow efficiency, this package tackles one of the most difficult challenges of all: state management.  We did all the complicated work so you don't have to.  While still following best practices and some common patterns, this tool allows you to easily and quickly set up your state, with minimal learning involved.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm i @thundersolutions/state
```

## Usage

First, make sure you've imported the necessary item ...
```js

// get the class or factory function as named exports
import { State, createState } from '@thundersolutions/state'

// or get the `State` class as a default export
import State from '@thundersolutions/state'

// You can also get the `createState()` factory function from the State class
const { createState } = State
```
... Or include it as a UMD.
```html
<script src="https://unpkg.com/@thundersolutions/state/umd/thunderState.min.js"></script>
<script>
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring
  const { State, createState } = ThunderState
</script>
```

Then create your state by adding some basic configuration options.
```js
const state = new State({

  state: {
    user: {
      username: 'demo_user',
      email: 'user@demo.com',
      preferences: {
        notifications: true,
        newsletter: false,
      },
    },
    loggedIn: true,
    alert: {
      visible: true,
      text: 'This is a demo alert'
    },
  },

  actions: {
    changeUsername({state, payload}) {
      state.user.username = payload
    },
    toggleLogin({state, payload}) {
      state.loggedIn = payload
    },
    toggleAlert({state, payload}) {
      state.alert.visible = payload
    },
  },

})
```

Retrieve the state from getters, which are automatically created from your initial state.
```js
console.log(state.getters.loggedIn) // true
console.log(state.getters.user.username) // 'demo_user'
```

Change the state by dispatching the actions defined above.
```js
state.dispatchers.changeUsername('new_user')
state.dispatchers.toggleAlert(false)
```

That's all you need for your first simple state!  Additionally, there are more options to make your state even more powerful, such as:
 * computed values
 * watchers
 * asynchronous actions
 * time travel debugging

Read more about these features in the [documentation](https://github.com/thunder-solutions/thunder-state/wiki).

## Maintainers

[@jonathandewitt-dev](https://github.com/jonathandewitt-dev)

## License

MIT © 2020 Jonathan DeWitt
