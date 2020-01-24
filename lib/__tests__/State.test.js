import State, {getStateSetError, getNotActionError} from '../State.js'
import DeepProxy from '../DeepProxy.js'
import testStateConfig from '../testUtilities/testStateConfig.js'

describe('State', () => {

  let appState

  beforeEach(() => {
    appState = new State(testStateConfig)
  })

  it('creates a state from the config object', () => {
    expect(appState.getters).toStrictEqual(new DeepProxy({
      account: new DeepProxy({
        user: new DeepProxy({
          username: 'example_user_one'
        }),
        settings: new DeepProxy({
          email: 'fake_one@email.com'
        })
      })
    }))
    expect(appState.dispatch).toBeInstanceOf(Function)
    expect(appState.timeTravel).not.toBeInstanceOf(Function)
  })

  it('updates the state when actions are dispatched', async () => {
    appState.dispatch('switchUser', 'example_user_two')
    appState.dispatch('switchAccount', 'fake_two@email.com')
    appState.dispatch('switchUser', 'example_user_three')
    await appState.dispatch('switchAccount', 'fake_three@gmail.com')
    expect(appState.getters.account.user.username).toBe('example_user_three')
    expect(appState.getters.account.settings.email).toBe('fake_three@gmail.com')
  })

  it('throws an error when trying to set state from getter', () => {
    const setUserFromGet = () => appState.getters.account.user.username = 'example_user'
    const setAccountFromGet = () => appState.getters.account = {}
    expect(() => setUserFromGet()).toThrow(getStateSetError())
    expect(() => setAccountFromGet()).toThrow(getStateSetError())
  })

  it('throws an error when trying to dispatch an action that doesn\'t exist', () => {
    const dispatchNonexistingAction = () => appState.dispatch('fake_action')
    expect(() => dispatchNonexistingAction()).toThrow(getNotActionError('fake_action'))
  })

  it('travels back and forth through the action history', async () => {
    appState = new State({
      debugVariable: 'state',
      ...testStateConfig,
    })
    expect(appState.timeTravel).toBeInstanceOf(Function)
    appState.dispatch('switchUser', 'example_user_two')
    appState.dispatch('switchAccount', 'fake_two@email.com')
    appState.dispatch('switchUser', 'example_user_three')
    await appState.dispatch('switchAccount', 'fake_three@gmail.com')
    appState.timeTravel(-2)
    expect(appState.getters.account.user.username).toBe('example_user_two')
    expect(appState.getters.account.settings.email).toBe('fake_two@email.com')
    appState.timeTravel(1)
    expect(appState.getters.account.user.username).toBe('example_user_three')
    expect(appState.getters.account.settings.email).toBe('fake_two@email.com')
  })

})