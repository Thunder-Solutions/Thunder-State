import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UseStoreExample from './useStore.example'

test('`useStore()` wraps all state properties in the proper React hooks', () => {
  render(<UseStoreExample />);
  const title = screen.getByTestId('title');
  const nameMsg = screen.getByTestId('nameMsg');
  const emailMsg = screen.getByTestId('emailMsg');
  const displayNameInput: HTMLInputElement = screen.getByTestId('displayNameInput');
  const emailInput: HTMLInputElement = screen.getByTestId('emailInput');
  const submitBtn = screen.getByTestId('submitBtn');

  // assert initial state
  expect(title).toHaveTextContent('user_one');
  expect(nameMsg).toHaveTextContent('No changes yet.');
  expect(emailMsg).toHaveTextContent('No changes yet.');

  // dispatch update user action
  displayNameInput.value = 'user_two';
  emailInput.value = 'user_two@demo.com';
  userEvent.click(submitBtn);

  // getters should be live updating
  expect(title).toHaveTextContent('user_two (user_two@demo.com)');

  // watchers should have updated the values
  expect(nameMsg).toHaveTextContent('Name changed to: user_two');
  expect(emailMsg).toHaveTextContent('Email changed to: user_two@demo.com');

  // dispatch update user action
  displayNameInput.value = 'user_three';
  emailInput.value = 'user_three@demo.com';
  userEvent.click(submitBtn);

  // getters should be live updating
  expect(title).toHaveTextContent('user_three (user_three@demo.com)');

  // display name watcher was destroyed, this should be unchanged
  expect(nameMsg).toHaveTextContent('Name changed to: user_two');

  // email watcher was not destroyed, it should have updated
  expect(nameMsg).toHaveTextContent('Name changed to: user_three@demo.com');
});
