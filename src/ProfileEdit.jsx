import { useContext, useRef, useState } from 'react';

import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);

  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user? user.avatar : null);

  const [avatarAltTextPreview, setAvatarAltTextPreview] = useState(user? user.avatarAltText : null);

  const nameInputRef = useRef(null);
  const avatarPreviewRef = useRef(null);
  const avatarAltTextRef = useRef(null);


  function avatarUpload(e) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const avatar = reader.result;

      setAvatarPreview(avatar);
    });

    reader.readAsDataURL(e.target.files[0]);
  }

  return <>
    <main>
      <h1>Edit Your Profile</h1>
      <form id="profile-edit" onSubmit={(e) => {
        e.preventDefault();
        if (removeAvatar) {
          // backend updates
          User.setAvatarAltText(null);
          User.setAvatar(null);

          // frontend updates
          setAvatarPreview(null);
          setAvatarAltTextPreview("");
        } else {
          User.setAvatarAltText(avatarAltTextPreview);
          User.setAvatar(avatarPreview);
        }
        setRemoveAvatar(false);
        const newUser = User.setName(nameInputRef.current.value);
        setUser(newUser);
      }}>
        <label htmlFor="avatar-input">Avatar</label>
          <div id="avatar-preview">
          {removeAvatar ?
          ''
          :
          <>
          <input type="file" id="avatar-input" name="avatar"
            accept="image/*"
            autoComplete="photo"
            onChange={avatarUpload}
          />
            {avatarPreview || (user && user.avatar) ?
              <label htmlFor="avatar-input"><img id="avatar-preview-img" className="avatar-medium" src={avatarPreview? avatarPreview : user.avatar} ref={avatarPreviewRef} /></label>
              :
              ''
            }
          </>
          }

          {removeAvatar ?
            <span id="no-avatar" aria-label="No avatar image">❌</span>
            :
            ''
          }

          {avatarPreview || (user && user.avatar) ?
            <>
            <div id="remove-avatar">
              <input id="remove-avatar-checkbox" type="checkbox" checked={removeAvatar}
                onChange={(e) => {
                  setRemoveAvatar(e.target.checked);
                }} />
              <label htmlFor="remove-avatar-checkbox">Remove avatar</label>
            </div>
            </>
            :
            <label htmlFor="avatar-input" id="avatar-upload-box" aria-label="Upload Image">📷</label>
          }
          </div>

        {(avatarPreview || (user && user.avatar)) && !removeAvatar ?
        <>
        <label htmlFor="avatar-alt-input">Avatar Alt Text</label>
        <textarea id="avatar-alt-input" name="avatar-alt" ref={avatarAltTextRef}
            value={avatarAltTextPreview? avatarAltTextPreview : (user? user.avatarAltText : "") }
            onChange = {(e) => setAvatarAltTextPreview(e.target.value)}
        />
        </>
        :
        ''
        }

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
