import { Button } from "@nextui-org/button"
import {Input, Textarea} from "@nextui-org/input";
import { useCallback, useContext, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AvatarUpload from './AvatarUpload.jsx';
import SystemNotificationsContext from './SystemNotificationsContext.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);

  const nameInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const avatarEditorRef = useRef({});

  const onAvatarChange = useCallback(newAvatar => (newAvatar? setAvatar(newAvatar) : ""), []);

  return <>
    <main className="profile-edit">
    <h1>Edit Your Profile</h1>

    <SystemNotificationArea />
    <form id="profile-edit" onSubmit={(e) => {
      e.preventDefault();

      // The rest of the avatar data comes through the state every time we make
      // an update, but the cropped version, we have to ask for specifically.
      if (avatarEditorRef && avatarEditorRef.current) {
        const editedAvatar = avatarEditorRef.current.getImage();
        User.setAvatar(editedAvatar);
      }

      User.setAvatarOrig(avatar.avatarOrig);
      User.setAvatarAltText(avatar.avatarAltText);
      User.setAvatarPosition(avatar.avatarPosition);
      User.setAvatarRotate(avatar.avatarRotate);
      User.setAvatarScale(avatar.avatarScale);

      User.setBio(bioInputRef.current.value);

      const newUser = User.setName(nameInputRef.current.value);
      setUser(newUser);

      setSystemNotifications([...systemNotifications, {uuid: uuidv4(), type: 'status', message: "Profile Updated"}]);

    }}>
      <div id="profile-fields">
        <label htmlFor="avatar-input" className="profile-field-label">Avatar</label>

        <AvatarUpload
          getImageRef={avatarEditorRef}
          onChange={onAvatarChange}
        />

        <Input name="name" isRequired label="Display Name" type="text" 
          placeholder="Your Name" ref={nameInputRef} 
          autoComplete="name" defaultValue={user? user.displayName : ""}
        />

        <Textarea name="bio" ref={bioInputRef} 
          className="my-4"
          label="Bio"
          placeholder="Tell people a little about yourself." 
          defaultValue={user? user.bio : ""}
        />
      </div>

      <Button type="submit" radius="full" color="primary">Save</Button>
    </form>
    </main>
  </>;
}
