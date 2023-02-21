import { createStore } from '../../core/src/index';
import { useStore } from '../src/index';

const UserStore = createStore({

  name: 'User',

  state: {
    displayName: 'demo_user',
    details: {
      email: 'user@demo.com',
    },
  },

  actions: {
    updateUser({ state, payload }) {
      state.displayName = payload.displayName;
      state.details.email = payload.email;
    },
  },

});

const UseStoreExample = () => {
  const userStore = useStore(UserStore);
  const handleLogout = async () => {
    // ... call logout API
    userStore.dispatchers.updateUser({
      displayName: '',
      email: '',
    });
  };

  userStore.watchers.displayName((newName: string) => {
    
  })
  return (
    <>
      <h1>Welcome back, {userStore.getters.displayName}!</h1>
      <button onClick={handleLogout}>Log Out</button>
    </>
  );
}

export default UseStoreExample;
