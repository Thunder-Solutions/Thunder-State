export default {
  
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
    switchUser({state, payload}) {
      state.account.user.username = payload
    },
    switchAccount({state, payload}) {
      state.account.settings.email = payload
    }
  },
  
}