import { useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AvatarEditor from 'react-avatar-editor';

import AvatarUpload from './AvatarUpload.jsx';
import InputSlider from './InputSlider.jsx';
import SystemNotificationsContext from './SystemNotificationsContext.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const nameInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const avatarEditorRef = useRef({});

  function onAvatarChange(newAvatar) {
    setAvatar(newAvatar);
  }

  return <>
    <h1>Edit Your Profile</h1>
    <SystemNotificationArea />
    <form id="profile-edit" onSubmit={(e) => {
      e.preventDefault();

      const editedAvatar = avatarEditorRef.current.getImage();
      User.setAvatar(avatar.avatar);
      User.setAvatarCropped(editedAvatar);
      User.setAvatarAltText(avatar.avatarAltText);
      User.setAvatarPosition(avatar.avatarPosition);
      User.setAvatarRotate(avatar.avatarRotate);
      User.setAvatarScale(avatar.avatarScale);

      const newUser = User.setName(nameInputRef.current.value);
      setUser(newUser);

      setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'status', message: "Profile Updated"}]);

    }}>
      <div id="profile-fields">
      <label htmlFor="avatar-input">Avatar</label>
        <AvatarUpload
          getImageRef={avatarEditorRef}
          onChange={onAvatarChange}
        />

      <label htmlFor="name-input">Name</label>
        <input id="name-input" name="name" ref={nameInputRef}
          autoComplete="name"
          defaultValue={user? user.displayName : ""}
        />
      </div>

      <button type="submit">Save your cool changes</button>
    </form>
  </>;
}
