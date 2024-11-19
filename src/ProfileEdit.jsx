import { useContext, useRef } from 'react';

import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);

  const nameInputRef = useRef(null);
  const avatarPreviewRef = useRef(null);

  function avatarUpload(e) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const avatar = reader.result;

      avatarPreviewRef.current.src = avatar;
    });

    const avatar = reader.readAsDataURL(e.target.files[0]);
  }

  return <>
    <main>
      <h1>Edit Your Profile</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        const newUser = User.setName(nameInputRef.current.value);
        const newerUser = User.setAvatar(avatarPreviewRef.current.src);

        setUser(newerUser);
      }}>
        <label htmlFor="avatar-input">Avatar</label>
          <div id="avatar-preview">
          <input type="file" id="avatar-input" name="avatar"
            accept="image/*"
            autoComplete="photo"
            onChange={avatarUpload}
          />
          {user && user.avatar ?
            <img className="avatar-medium" src={user.avatar} ref={avatarPreviewRef} />
            :
            ''
          }
          </div>

        <label htmlFor="name-input">Name</label>
          <input id="name-input" name="name" ref={nameInputRef}
            autoComplete="name"
            defaultValue={user? user.displayName : ""}
          />

        <p>
        <button type="submit">Save your cool changes</button>
        </p>
      </form>
    </main>
  </>;
}
