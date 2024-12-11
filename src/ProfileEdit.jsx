import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import { Button } from "@nextui-org/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import {Input, Textarea} from "@nextui-org/input";
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDisclosure } from "@nextui-org/use-disclosure"
import { v4 as uuidv4 } from 'uuid';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";

import AvatarUpload from './AvatarUpload.jsx';
import DarkModeContext from "./DarkModeContext.jsx";
import icons from './icons.js'
import SystemNotificationsContext from './SystemNotificationsContext.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import User from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const { user, setUser } = useContext(UserContext);
  const { systemNotifications, setSystemNotifications } = useContext(SystemNotificationsContext);
  const [darkMode, setDarkMode] = useContext(DarkModeContext);
  const imageEditorDisclosure = useDisclosure();

  const nameInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const avatarEditorRef = useRef({});
  const avatarFallbackColor = user? hashSum(user.handle).substring(0,6).toUpperCase() : '000000';

  const onAvatarChange = useCallback(newAvatar => (newAvatar? setAvatar(newAvatar) : ""), []);

  // I copy/pasted stuff from the AvatarUpload component when I realized I needed to lift up the state.
  // I didn't want to mess with the namespace here, so I'm making this into a function.
  // I wanted to make sure you could close the modal and then open it back up to continue where you left off.
  const avatarEditingState = (() => {
    const [avatarDraft, setAvatarDraft] = useState(false);
    const [avatarEdited, setAvatarEdited] = useState(user? user.avatar : null);
    const [avatarOrig, setAvatarOrig] = useState(user? user.avatarOrig : null);
    const [avatarAltText, setAvatarAltText] = useState("");
    const [avatarPosition, setAvatarPosition] = useState({x: 0.5, y: 0.5});
    const [avatarRotate, setAvatarRotate] = useState(0);
    const [avatarScale, setAvatarScale] = useState(1);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    return {
      avatarDraft, setAvatarDraft,
      avatarEdited, setAvatarEdited,
      avatarOrig, setAvatarOrig,
      avatarAltText, setAvatarAltText,
      avatarPosition, setAvatarPosition,
      avatarRotate, setAvatarRotate,
      avatarScale, setAvatarScale,
      removeAvatar, setRemoveAvatar,
    };
  })();

  function resetAvatar() {
    avatarEditingState.setAvatarDraft(false);
    avatarEditingState.setAvatarEdited(user.avatarEdited);
    avatarEditingState.setAvatarOrig(user.avatarOrig);
    avatarEditingState.setAvatarAltText(user.avatarAltText);
    avatarEditingState.setAvatarPosition(user.avatarPosition);
    avatarEditingState.setAvatarRotate(user.avatarRotate);
    avatarEditingState.setAvatarScale(user.avatarScale);
  }

  // When you first load the page, the previews will be empty.
  // Load them with the saved values.
  useEffect(() => {
    if (user) {
      resetAvatar();
    }
  }, [user]);

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

        <Button className="avatar-edit-button h-[205px] w-[210px]" onPress={imageEditorDisclosure.onOpen}>
          <div className="avatar-edit-label text-center absolute left-[15px] z-[-1] font-bold text-lg">
            <FontAwesomeIcon icon={icons.camera} className="avatar-edit-icon h-[50px] w-[50px]" />
            <br />
            <span style={{textShadow: "hsl(var(--nextui-background)) 0 0 5px"}}>Change Avatar Image</span>
          </div>

          <Avatar isBordered radius="full" className="shrink-0 w-[200px] h-[200px]" src={user.avatar} name={user.displayName} 
            style={{'--avatar-bg': '#'+avatarFallbackColor}}
            classNames={{base: "bg-[--avatar-bg]"}}
          />
        </Button>

        <Modal isOpen={imageEditorDisclosure.isOpen} onOpenChange={imageEditorDisclosure.onOpenChange}
          className={darkMode? "dark" : ""}
          >
          <ModalContent>
          { onClose => <>
            <ModalBody>
              <label htmlFor="avatar-input" className="profile-field-label">Avatar</label>

              <AvatarUpload
                darkMode={darkMode}
                getImageRef={avatarEditorRef}
                onChange={onAvatarChange}
                avatarEditingState={avatarEditingState}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="solid" color="primary">
                Save
              </Button>

              <Button variant="solid" color="danger" onPress={() => { 
                // If they haven't touched the avatar (no draft exists), let them cancel without confirming.
                if (!avatarEditingState.avatarDraft || confirm("Cancel???")) { 
                  resetAvatar();
                  onClose(); 
                }
              }}>
                Cancel
              </Button>
            </ModalFooter>
            </>
          }
          </ModalContent>
        </Modal>

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
