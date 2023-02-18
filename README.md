# Thunder State

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

*Complex state management made easy.*

Thunder State is an agnostic state management library built on the philosophy that the burden of complexity shouldn't rest on the consumer. It's meant to be a breath of fresh air after dealing with complicated Redux and NgRx setups. Thunder-State is heavily inspired by Vuex/Pinia, but with a few extra precautions to prevent direct mutations using proxies.

If you're a fan of the time-travel debugging offered by libraries like Redux, Thunder State has a [browser extension](https://chrome.google.com/webstore/detail/thunder-state-dev-tools/dgjfpfpdpcjkildgafemjcojafkppoib) for that, too!

![Thunder State browser extension](https://lh3.googleusercontent.com/UyGD-qT3kFjlh_cU7Aw7LctBdaHUkeuAaa2acJFIoxEshlzl9OtaGnpeMvpfASJQFceMZh7kfEeD9ECneMzNL1jUnQ=w640-h400-e365-rj-sc0x00ffffff)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

For the basic functionality, you only need to install the core package.

```
npm i @thunder-state/core
```

To make integration with React easy, you'll want to install an additional package.

```
npm i @thunder-state/core @thunder-state/react
```

## Usage

Create your state by adding some basic configuration options.

```js
import { createStore } from '@thunder-state/core';

const UserStore = createStore({

  name: 'User',

  state: {
    displayName: 'demo_user',
    details: {
      email: 'user@demo.com',
    },
  },

  actions: {
    updateUser({ state, payload }) {
      state.displayName = payload.displayName;
      state.details.email = payload.email;
    },
  },

});
```

### 1. Direct Usage

---

Retrieve the state from getters, which are automatically created from your initial state.

```js
console.log(UserStore.getters.displayName); // demo_user'
console.log(UserStore.getters.details.email); // 'user@demo.com'
```

Change the state by dispatching the actions defined above.

```js
UserStore.dispatchers.updateUser({
  displayName: 'new_user',
  email: 'newUser@demo.com',
});
```

### 2. React Usage

---

To use this package with React, you'll want to import the main function from `@thunder-state/react`, which returns several hooks.

```jsx
import { createStore } from '@thunder-state/core';
import { useStore } from '@thunder-state/react';

const UserStore = createStore({
  // ...config
});

const Greeting = () => {
  const userStore = useStore(UserStore);
  const handleLogout = async () => {
    // ... call logout API
    userStore.dispatchers.updateUser({
      displayName: '',
      email: '',
    });
  };
  return (
    <h1>Welcome back, {userStore.getters.displayName}!</h1>
    <button onClick={handleLogout}>Log Out</button>
  );
}

```

### 3. Advanced Usage

---

**Thunder State** also provides some additional features:

 * [Watchers](https://github.com/Thunder-Solutions/Thunder-State/wiki/6-Reacting-to-changes) - for reactive programming.
 * [Computed values](https://github.com/Thunder-Solutions/Thunder-State/wiki/4---Computed-values) - no need to call a function, these evaluate when you reference them.
 * [Asynchronous actions](https://github.com/Thunder-Solutions/Thunder-State/wiki/5-Async-actions) - just add async in front of your methods!
 * [Time travel debugging](https://github.com/Thunder-Solutions/Thunder-State/wiki/7-Time-travel-debugging) - Use a browser extension to walk through the history with live updates.

Read about these features and more in the [documentation](https://github.com/thunder-solutions/thunder-state/wiki).

## Maintainers

[@jonathandewitt-dev](https://github.com/jonathandewitt-dev)
[@veritem](https://github.com/veritem)

## License

MIT © 2023 Thunder Solutions LLC
