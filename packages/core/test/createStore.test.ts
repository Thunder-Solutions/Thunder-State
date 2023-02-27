import { createStore } from '../src/index';

/**
 * A quick function to use the same config in each test,
 * but only define it one time to reduce repetetiveness.
 */
const createUserStore = () => createStore({

  name: 'User',

  state: {
    displayName: 'user_one',
    details: {
      firstName: 'Jon',
      lastName: 'DeWitt',
      email: 'user_one@demo.com',
    },
    fetched: false,
  },

  computed: {
    fullName(state) {
      return `${state.details.firstName} ${state.details.lastName}`;
    },
  },

  actions: {
    updateUser({ state, payload }) {
      const { displayName, email, firstName, lastName } = payload
      if (displayName) state.displayName = displayName;
      if (email) state.details.email = email;
      if (firstName) state.details.firstName = firstName;
      if (lastName) state.details.lastName = lastName;
    },
    async mockFetch({ state }) {
      await new Promise((resolve) => {
        setTimeout(() => resolve(null), 500);
      });
      state.fetched = true;
    },
  },

});

/**
 * =================================================
 * ================= START TESTS ===================
 * =================================================
 */

test('adds getters that can\'t be reassigned', () => {
  const UserStore = createUserStore();
  expect(UserStore.getters.displayName).toBe('user_one');
  expect(UserStore.getters.details.email).toBe('user_one@demo.com');
  const reassignDisplayName = () => { UserStore.getters.displayName = 'user_two'; };
  const reassignEmail = () => { UserStore.getters.details.email = 'user_two@demo.com'; };
  expect(reassignDisplayName).toThrow();
  expect(reassignEmail).toThrow();
});

test('adds actions that mutate the state', async () => {
  const UserStore = createUserStore();
  expect(UserStore.dispatchers.updateUser).toBeDefined();
  const payload = { displayName: 'user_two', email: 'user_two@demo.com' }
  await UserStore.dispatchers.updateUser(payload);
  expect(UserStore.getters.displayName).toBe(payload.displayName);
  expect(UserStore.getters.details.email).toBe(payload.email);
});

test('adds computed getters to the state', async () => {
  const UserStore = createUserStore();
  expect(UserStore.getters.fullName).toBe('Jon DeWitt');
  const payload = { firstName: 'George', lastName: 'Washington' };
  await UserStore.dispatchers.updateUser(payload);
  expect(UserStore.getters.fullName).toBe('George Washington');
});

test('adds awaitable async actions', async () => {
  const UserStore = createUserStore();
  expect(UserStore.getters.fetched).toBe(false);
  await UserStore.dispatchers.mockFetch();
  expect(UserStore.getters.fetched).toBe(true);
});

/**
 * This one is a bit more complex;
 * calls for a bit extra documentation to explain.
 */
test('adds watchers with optional destroy', async () => {
  const UserStore = createUserStore();

  // add a watcher and a mutable value to test it
  let watcherValue = null;
  UserStore.watchers.displayName((newDisplayName, destroy) => {
    watcherValue = newDisplayName;
    destroy();
  });

  // assert the initial value
  expect(watcherValue).toBe(null);

  // update the state
  const payload1 = { displayName: 'user_two' };
  await UserStore.dispatchers.updateUser(payload1);

  // prove the watcher ran successfully
  expect(watcherValue).toBe(payload1.displayName);

  // update the state
  const payload2 = { displayName: 'user_three' };
  await UserStore.dispatchers.updateUser(payload2);

  // watcher was destroyed, should still be the old value
  expect(watcherValue).toBe(payload1.displayName);
});
