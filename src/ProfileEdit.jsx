import { useContext, useRef } from 'react';

import UserContext from './UserContext.jsx';

import User from './logic/user.js';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);

  const nameInputRef = useRef(null);

  return <>
    <main>
      <h1>Edit Your Profile</h1>
      <form onSubmit={() => {
        const newUser = User.setName(nameInputRef.current.value);
        setUser(newUser);
      }}>
        <label htmlFor="name-input">Name</label><input id="name-input" name="name" ref={nameInputRef}
          defaultValue={user? user.displayName : ""} />

        <p>
        <button type="submit">Save your cool changes</button>
        </p>
      </form>
    </main>
  </>;
}
