// This is for testing the final build:
import State from '../esm/simpleState.min.mjs'
// import State from '../lib/State.js'

const appState = new State({

  debugVariable: 'state',

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
    switchAccount({state, payload}, done) {
      setTimeout(() => {
        state.account.settings.email = payload
        done()
      }, 1000)
    },
    switchUser({state, payload}) {
      state.account.user.username = payload
    }
  },
})

let value = ''
appState.watchers.account.user.username(newValue => value = newValue)
appState.dispatchers.switchUser('example_user_two')
appState.dispatchers.switchAccount('fake_two@email.com')
appState.dispatchers.switchUser('example_user_three')
appState.dispatchers.switchAccount('fake_three@gmail.com').then(() => {
  console.log(value)
  // console.log(state.getters.account.user.username)
  // console.log(state.getters.account.settings.email)
  // state.timeTravel(-2)
  // console.log(state.getters.account.user.username)
  // console.log(state.getters.account.settings.email)
  // state.timeTravel(1)
  // console.log(state.getters.account.user.username)
  // console.log(state.getters.account.settings.email)
})