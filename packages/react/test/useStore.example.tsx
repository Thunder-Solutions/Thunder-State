import { useState, FormEventHandler } from 'react';
import { createStore } from '../../core/src/index';
import { useStore } from '../src/index';

const UserStore = createStore({

  name: 'User',

  state: {
    displayName: 'user_one',
    details: {
      email: 'user_one@demo.com',
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

  const [nameMsg, setNameMsg] = useState('No changes yet.');
  const [emailMsg, setEmailMsg] = useState('No changes yet.');
  userStore.watchers.displayName((newName: string, destroy) => {
    setNameMsg(`Name changed to: ${newName}`);
    destroy();
  });
  userStore.watchers.details.email((newEmail: string) => {
    setEmailMsg(`Email changed to: ${newEmail}`);
  });

  return (
    <>
      <h1 data-testid="title">{userStore.getters.displayName} ({userStore.getters.details.email})</h1>
      <p data-testid="nameMsg">{nameMsg}</p>
      <p data-testid="emailMsg">{emailMsg}</p>
      <form onSubmit={handleChangeUser}>
        <input data-testid="displayNameInput" name="displayName" />
        <input data-testid="emailInput" name="email" />
        <button data-testid="submitBtn">Change User</button>
      </form>
    </>
  );
}

export default UseStoreExample;
