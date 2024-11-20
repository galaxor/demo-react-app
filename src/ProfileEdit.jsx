import { useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AvatarEdit from 'react-avatar-edit';

// import InputSlider from './InputSlider.jsx';
import SystemNotificationsContext from './SystemNotificationsContext.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const nameInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);

  // When you first load the page, the previews will be empty.
  // Load them with the saved values.
  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);


  return <>
    <h1>Edit Your Profile</h1>
    <SystemNotificationArea />
    <form id="profile-edit" onSubmit={(e) => {
      e.preventDefault();

      User.setAvatar(avatarPreview);
      // User.setAvatarAltText(avatarAltTextPreview);
      // User.setAvatarPosition(avatarPosition);
      // User.setAvatarRotate(avatarRotate);
      // User.setAvatarScale(avatarScale);

      const newUser = User.setName(nameInputRef.current.value);
      setUser(newUser);

      setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'status', message: "Profile Updated"}]);
    }}>
      <div id="profile-fields">
      <label htmlFor="avatar-input">Avatar</label>
        <AvatarEdit
          width={250}
          height={250}
          mimeTypes="image/*"
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
