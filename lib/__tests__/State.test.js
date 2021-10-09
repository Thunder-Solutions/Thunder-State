import State from '../State.js'
import {DeepProxy} from '../DeepProxy.js'
import testStateConfig from '../testUtilities/testStateConfig.js'
import {getStateSetError} from '../utilities.js'

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

  it('computes dynamic values properly', async () => {
    expect(appState.getters.userAndEmail).toBe('example_user_one fake_one@email.com')
    await appState.dispatchers.switchUser('example_user_two')
    expect(appState.getters.userAndEmail).toBe('example_user_two fake_one@email.com')
    await appState.dispatchers.switchAccount('fake_two@email.com')
    expect(appState.getters.userAndEmail).toBe('example_user_two fake_two@email.com')
  })

  it('reacts to state changes and runs callbacks', async () => {
    let value = ''
    const callback = jest.fn(newValue => value = newValue)
    appState.watchers.account.user.username(callback)
    await appState.dispatchers.switchUser('example_user_two')
    expect(callback).toHaveBeenCalledWith('example_user_two')
    expect(value).toBe('example_user_two')
  })

  it('reacts to computed value changes and runs callbacks', async () => {
    let value = ''
    const callback = jest.fn(newValue => value = newValue)
    appState.watchers.userAndEmail(callback)
    await appState.dispatchers.switchUser('example_user_two')
    expect(callback).toHaveBeenCalledWith('example_user_two fake_one@email.com')
    expect(value).toBe('example_user_two fake_one@email.com')
  })
})