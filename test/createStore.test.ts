import { createStore } from '../src/index';

describe('createStore', () => {
  it ('creates a state object', () => {
    const store = createStore({
      name: 'demo',
      state: {
        topLevel: 'hello world',
        nested: {
          nested: 'hello world',
        },
      },
    });
    store.getters.topLevel;
    store.getters.nested.nested;
  });
});
