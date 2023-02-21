import { useState, FormEventHandler } from 'react';
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
  const handleChangeUser: FormEventHandler = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    userStore.dispatchers.updateUser({
      displayName: formData.get('displayName'),
      email: formData.get('email'),
    });
  };

  const [msg, setMsg] = useState('No changes yet.');
  userStore.watchers.displayName((newName: string) => {
    setMsg(`Changed to: ${newName}`);
  });

  return (
    <>
      <h1>{userStore.getters.displayName}</h1>
      <p>{msg}</p>
      <form onSubmit={handleChangeUser}>
        <input name="displayName" />
        <input name="email" />
        <button>Change User</button>
      </form>
    </>
  );
}

export default UseStoreExample;
