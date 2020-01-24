import State, {getStateSetError} from '../State.js'
import DeepProxy from '../DeepProxy.js'
import testStateConfig from '../testUtilities/testStateConfig.js'

describe('State', () => {

  let appState = new State(testStateConfig)

  afterEach(() => {
    appState = new State(testStateConfig)
  })

  it('creates a state from the config object', () => {
    const getters = new DeepProxy({
      account: new DeepProxy({
        user: new DeepProxy({
          username: 'example_user_one',
        }),
        settings: new DeepProxy({
          email: 'fake_one@email.com',
        }),
      }),
    })
    const computed = {
      userAndEmail(state) {
        return state.account.user.username + ' ' + state.account.settings.email 
      },
    }
    const immutableState = new DeepProxy(
      testStateConfig.state,
      { set: () => { throw getStateSetError() }}
    )
    Object.defineProperty(getters, 'userAndEmail', {
      enumerable: true,
      get: () => computed['userAndEmail'](immutableState),
      set: () => { throw getStateSetError() },
    })
    expect(appState.getters).toStrictEqual(getters)
    expect(appState.timeTravel).not.toBeInstanceOf(Function)
  })

  it('updates the state when actions are dispatched', async () => {
    appState.dispatchers.switchUser('example_user_two')
    appState.dispatchers.switchAccount('fake_two@email.com')
    appState.dispatchers.switchUser('example_user_three')
    await appState.dispatchers.switchAccount('fake_three@gmail.com')
    expect(appState.getters.account.user.username).toBe('example_user_three')
    expect(appState.getters.account.settings.email).toBe('fake_three@gmail.com')
  })

  it('throws an error when trying to set state from getter', () => {
    const setUserFromGet = () => appState.getters.account.user.username = 'example_user'
    const setAccountFromGet = () => appState.getters.account = {}
    expect(() => setUserFromGet()).toThrow(getStateSetError())
    expect(() => setAccountFromGet()).toThrow(getStateSetError())
  })

  it('computes dynamic values properly', async () => {
    expect(appState.getters.userAndEmail).toBe('example_user_one fake_one@email.com')
    await appState.dispatchers.switchUser('example_user_two')
    expect(appState.getters.userAndEmail).toBe('example_user_two fake_one@email.com')
    await appState.dispatchers.switchAccount('fake_two@email.com')
    expect(appState.getters.userAndEmail).toBe('example_user_two fake_two@email.com')
  })

  it('travels back and forth through the action history', async () => {
    appState = new State({
      debugVariable: 'state',
      ...testStateConfig,
    })
    expect(appState.timeTravel).toBeInstanceOf(Function)
    appState.dispatchers.switchUser('example_user_two')
    appState.dispatchers.switchAccount('fake_two@email.com')
    appState.dispatchers.switchUser('example_user_three')
    await appState.dispatchers.switchAccount('fake_three@gmail.com')
    appState.timeTravel(-2)
    expect(appState.getters.account.user.username).toBe('example_user_two')
    expect(appState.getters.account.settings.email).toBe('fake_two@email.com')
    appState.timeTravel(1)
    expect(appState.getters.account.user.username).toBe('example_user_three')
    expect(appState.getters.account.settings.email).toBe('fake_two@email.com')
  })

})