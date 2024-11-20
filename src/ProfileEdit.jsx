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
  const avatarPreviewRef = useRef(null);
  const avatarAltTextRef = useRef(null);

  return <>
    <h1>Edit Your Profile</h1>
    <SystemNotificationArea />
    <form id="profile-edit" onSubmit={(e) => {
      e.preventDefault();
      /*
      if (removeAvatar) {
        // backend updates
        User.setAvatarAltText(null);
        User.setAvatar(null);

        // frontend updates
        setAvatarPreview(null);
        setAvatarAltTextPreview("");
      } else {
        User.setAvatar(avatarPreview);
        User.setAvatarAltText(avatarAltTextPreview);
        User.setAvatarPosition(avatarPosition);
        User.setAvatarRotate(avatarRotate);
        User.setAvatarScale(avatarScale);
      }
      setRemoveAvatar(false);
      */

      const newUser = User.setName(nameInputRef.current.value);
      setUser(newUser);

      setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'status', message: "Profile Updated"}]);
    }}>
      <div id="profile-fields">
      <label htmlFor="avatar-input">Avatar</label>
        <AvatarUpload />

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
