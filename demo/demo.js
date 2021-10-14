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
    string: 'null',
    boolean: false,
    stringPay: 'null',
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
    async switchStr({state}) {
      await wait(1000)
      state.string = 'hello, world'
    },
    async switchStrPay({state, payload}) {
      await wait(1000)
      state.stringPay = payload
    },
    async switchBool({state}) {
      await wait(1000)
      state.boolean = true
    },
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

// make sure getters are updating properly
console.log('boolean BEFORE action:', appState.getters.boolean)
console.log('string BEFORE action:', appState.getters.string)
console.log('stringPay BEFORE action:', appState.getters.stringPay)
console.log('username BEFORE action:', appState.getters.account.user.username)
appState.dispatchers.switchBool().then(() => {
  console.log('boolean AFTER action:', appState.getters.boolean)
})
appState.dispatchers.switchStr().then(() => {
  console.log('string AFTER action:', appState.getters.string)
})
appState.dispatchers.switchStrPay('new string').then(() => {
  console.log('stringPay AFTER action:', appState.getters.stringPay)
})
appState.dispatchers.switchUser('example_user_two').then(() => {
  console.log('username AFTER action:', appState.getters.account.user.username)
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
    computedTestArr({thisIsATest}) {
      return thisIsATest.map(v => `>${v}`)
    },
    computedTestName({computedTestArr}) {
      return computedTestArr.join(' ')
    },
  },

  // enableDevTools: false,
})

otherState.watchers.computedTestName(newVal => {
  console.log('computed test:', newVal)
})

otherState.watchers.thisIsATest(newVal => {
  console.log('array changed:', newVal)
})

otherState.dispatchers.populateList()

otherState.dispatchers.changeColor('blue')
otherState.dispatchers.changeValueInList([1, 'a different another value'])
otherState.dispatchers.removeValue([1, 1])
otherState.dispatchers.addValue('oh look, another!')
otherState.dispatchers.changeValue(false)
