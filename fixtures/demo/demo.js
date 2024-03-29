// This is for testing the final build:
import { createStore } from '../../packages/core/dist/index.mjs'

const wait = time => new Promise(resolve => {
  setTimeout(() => { resolve() }, time)
})

window.appState = createStore({

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

window.otherState = createStore({

  name: 'Test',

  state: {
    color: 'red',
    someOtherVal: null,
    watchThis: {
      variable: 'test',
    },
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

    addValue({state, getters, dispatchers, payload}) {
      console.log('adding value')
      state.thisIsATest.push({
        color: getters.color,
        value: payload.value,
      })
      if (payload.color) {
        console.log('changing color')
        console.log(dispatchers)
        dispatchers.changeColor(payload.color)
      }
    },

    removeValue({state, payload: [index, count]}) {
      state.thisIsATest.splice(index, count)
    },

    populateList({state}) {
      state.thisIsATest = [
        { value: 'hello world' },
        { value: 'another value' },
      ]
    },

    changeValueInList({state, payload: [index, value]}) {
      state.thisIsATest[index] = value
    },

    changeValue({state, payload}) {
      console.log('changing value')
      state.someOtherVal = payload
    },

    changeVariable({state, payload}) {
      state.watchThis.variable = payload
    },
  },

  computed: {
    computedTestArr({thisIsATest}) {
      return thisIsATest.map(({ value })=> `>${value}`)
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
otherState.dispatchers.changeValueInList([1, { value: 'a different another value' }])
otherState.dispatchers.removeValue([1, 1])
;(async () => {
  await otherState.dispatchers.addValue({ color: 'black', value: 'oh look, another!' })
  otherState.dispatchers.changeValue(false)
})()

;(async () => {
  const testWatcher = newColor => { console.warn('test watcher:', newColor) }
  otherState.watchers.color(testWatcher)
  otherState.dispatchers.changeColor('green')
  await otherState.watchers.color.destroy(testWatcher)
  otherState.dispatchers.changeColor('purple')
})()


otherState.watchers.watchThis(() => {
  console.log('watching this')
})
otherState.watchers.watchThis.variable(newVar => {
  console.log(newVar)
})
otherState.dispatchers.changeVariable('hello world')
