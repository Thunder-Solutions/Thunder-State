export default {
  
  // set up the structure and set the initial state
  state: {
    account: {
      user: {
        username: 'example_user_one',
      },
      settings: {
        email: 'fake_one@email.com',
      },
    },
  },

  computed: {
    userAndEmail(state) {
      return state.account.user.username + ' ' + state.account.settings.email 
    },
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
    },
  },
  
}