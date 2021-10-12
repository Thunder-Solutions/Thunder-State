// This is for testing the final build:
import State, { createState } from '../esm/thunderState.min.mjs'
// import State from '../lib/State.js'

const wait = time => new Promise(resolve => {
  setTimeout(() => { resolve() }, time)
})

window.appState = new State({

  name: 'Demo',

  // set up the structure and set the initial state
  state: {
    account: {
      user: {
        username: 'example_user_one'
      },
      settings: {
        email: 'fake_one@email.com'
      }
    }
  },
  
  // define the actions that can be called by appState.dispatch('actionName', payload)
  actions: {
    async switchAccount({state, payload}) {
      await wait(1000)
      state.account.settings.email = payload
    },
    switchUser({state, payload}) {
      state.account.user.username = payload
    }
  },

  // enableDevTools: false,
})

// DOM queries and watchers to reflect in UI
const usernameEl = document.querySelector('.username-js')
const emailEl = document.querySelector('.email-js')
usernameEl.textContent = appState.getters.account.user.username
emailEl.textContent = appState.getters.account.settings.email

appState.watchers.account.user.username(newValue => usernameEl.textContent = newValue)
appState.watchers.account.user.username((newValue, destroy) => {
  console.log('watcher1', newValue)
  destroy()
})
appState.watchers.account.user.username(newValue => console.log('watcher2', newValue))
appState.watchers.account.settings.email(newValue => emailEl.textContent = newValue)


appState.dispatchers.switchUser('example_user_two')
appState.dispatchers.switchAccount('fake_two@email.com')
appState.dispatchers.switchUser('example_user_three')
appState.dispatchers.switchAccount('fake_three@email.com')

window.otherState = createState({

  name: 'Test',

  state: {
    color: 'red',
    someOtherVal: null,
    thisIsATest: [],
    anotherTest: [
      { name: 'one', value: 1 },
      { name: 'two', value: 2 },
      { name: 'three', value: 3 },
    ],
  },
  
  actions: {
    changeColor({state, payload}) {
      state.color = payload
    },

    addValue({state, payload}) {
      state.thisIsATest.push(payload)
    },

    removeValue({state, payload: [index, count]}) {
      state.thisIsATest.splice(index, count)
    },

    populateList({state}) {
      state.thisIsATest = [
        'hello world',
        'another value',
      ]
    },

    changeValueInList({state, payload: [index, value]}) {
      state.thisIsATest[index] = value
    },

    changeValue({state, payload}) {
      state.someOtherVal = payload
    },
  },

  computed: {
    computedTestArr({anotherTest}) {
      return anotherTest.map(({name}) => name)
    },
    computedTestName({computedTestArr}) {
      if (!computedTestArr) return
      return computedTestArr.join(' ')
    },
  },

  // enableDevTools: false,
})

console.log('computed test', otherState.getters.computedTestName)

otherState.watchers.thisIsATest(newVal => {
  console.log('array changed:', newVal)
})

otherState.dispatchers.populateList()

otherState.dispatchers.changeColor('blue')
otherState.dispatchers.changeValueInList([1, 'a different another value'])
otherState.dispatchers.removeValue([1, 1])
otherState.dispatchers.addValue('oh look, another!')
otherState.dispatchers.changeValue(false)
