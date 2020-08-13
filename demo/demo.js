// This is for testing the final build:
import State from '../esm/simpleState.min.mjs'
// import State from '../lib/State.js'

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

// DOM queries and watchers to reflect in UI
const usernameEl = document.querySelector('.username-js')
const emailEl = document.querySelector('.email-js')
usernameEl.textContent = appState.getters.account.user.username
emailEl.textContent = appState.getters.account.settings.email
appState.watchers.account.user.username(newValue => usernameEl.textContent = newValue)
appState.watchers.account.settings.email(newValue => emailEl.textContent = newValue)


appState.dispatchers.switchUser('example_user_two')
appState.dispatchers.switchAccount('fake_two@email.com')
appState.dispatchers.switchUser('example_user_three')
appState.dispatchers.switchAccount('fake_three@email.com')