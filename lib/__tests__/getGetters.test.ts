import getGetters from '../getGetters'
import testStateConfig from '../testUtilities/testStateConfig'
import { getStateSetError } from '../utilities'

const { state, computed } = testStateConfig
const getters = getGetters(state, computed)

it('gets all getters from state config', () => {
  expect(getters.account.user.username).toBe('example_user_one')
  expect(getters.account.settings.email).toBe('fake_one@email.com')
  expect(getters.userAndEmail).toBe('example_user_one fake_one@email.com')
})

it('throws an error when trying to set state from getter', () => {
  const setUserFromGet = () => getters.account.user.username = 'example_user'
  const setAccountFromGet = () => getters.account = {}
  const setUserAndEmailFromGet = () => getters.userAndEmail = 'user_one fake@email.com'
  expect(() => setUserFromGet()).toThrow(getStateSetError())
  expect(() => setAccountFromGet()).toThrow(getStateSetError())
  expect(() => setUserAndEmailFromGet()).toThrow(getStateSetError())
})
