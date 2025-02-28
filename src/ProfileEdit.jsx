import { Button } from "@nextui-org/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Form} from "@nextui-org/form";
import {Input, Textarea} from "@nextui-org/input";
import { toast } from 'react-toastify'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDisclosure } from "@nextui-org/use-disclosure"
import { useNavigate } from "react-router"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";

import Avatar from './components/Avatar.jsx'
import AvatarUpload from './AvatarUpload.jsx';
import DarkModeContext from "./DarkModeContext.jsx";
import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
import UserContext from './UserContext.jsx';

import UserDB from './logic/user.js';

import './static/ProfileEdit.css';

export default function ProfileEdit() {
  const db = useContext(DatabaseContext);
  const userDB = new UserDB(db);

  const { user, setUser } = useContext(UserContext);
  const [darkMode, setDarkMode] = useContext(DarkModeContext);
  const imageEditorDisclosure = useDisclosure();
  const navigate = useNavigate();

  const nameInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const avatarEditorRef = useRef({});

  const onAvatarChange = useCallback(newAvatar => (newAvatar? setAvatar(newAvatar) : ""), []);

  // I copy/pasted stuff from the AvatarUpload component when I realized I needed to lift up the state.
  // I didn't want to mess with the namespace here, so I'm making this into a function.
  // I wanted to make sure you could close the modal and then open it back up to continue where you left off.
  const [avatarDraft, setAvatarDraft] = useState(false);
  const [avatarEdited, setAvatarEdited] = useState(user.avatar);
  const [avatarOrig, setAvatarOrig] = useState(user.avatarOrig);
  const [avatarAltText, setAvatarAltText] = useState(user.avatarAltText);
  const [avatarPosition, setAvatarPosition] = useState(user.avatarPosition);
  const [avatarRotate, setAvatarRotate] = useState(user.avatarRotate);
  const [avatarScale, setAvatarScale] = useState(user.avatarScale);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [nameInputValue, setNameInputValue] = useState(user? user.displayName : "");
  const formRef = useRef(null);

  return <>
    <main className="profile-edit">
    <h1>Edit Your Profile</h1>

    <Form ref={formRef} id="profile-edit" className="w-full" onSubmit={async (e) => {
      e.preventDefault();

      await userDB.setBio(bioInputRef.current.value);
      await userDB.setName(nameInputRef.current.value);

      const newUser = await userDB.loggedInUser();

      setUser(newUser);

      toast("Profile Updated", {type: 'success'});
      // navigate("/profile");
    }}>
      <div id="profile-fields" className="w-full">

        <Button className="avatar-edit-button h-[205px] w-[210px]" onPress={imageEditorDisclosure.onOpen}>
          <div className="avatar-edit-label text-center absolute left-[15px] z-[-1] font-bold text-lg">
            <FontAwesomeIcon icon={icons.camera} className="avatar-edit-icon h-[50px] w-[50px]" />
            <br />
            <span style={{textShadow: "hsl(var(--nextui-background)) 0 0 5px"}}>Change Avatar Image</span>
          </div>

          <Avatar person={user} className="shrink-0 w-[200px] h-[200px]" />
        </Button>

        <Modal isOpen={imageEditorDisclosure.isOpen} onOpenChange={imageEditorDisclosure.onOpenChange}
          className={(darkMode? "dark" : "")+" max-h-screen overflow-y-auto"}
          >
          <ModalContent>
          { onClose => <>
            <ModalBody>
              <label htmlFor="avatar-input" className="profile-field-label">Avatar</label>

              <AvatarUpload
                darkMode={darkMode}
                getImageRef={avatarEditorRef}
                onChange={onAvatarChange}
                avatarEditingState={{
                  avatarDraft, setAvatarDraft,
                  avatarEdited, setAvatarEdited,
                  avatarOrig, setAvatarOrig,
                  avatarAltText, setAvatarAltText,
                  avatarPosition, setAvatarPosition,
                  avatarRotate, setAvatarRotate,
                  avatarScale, setAvatarScale,
                  removeAvatar, setRemoveAvatar,
                }}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="solid" color="primary" onPress={async () => {
                // The rest of the avatar data comes through the state every time we make
                // an update, but the cropped version, we have to ask for specifically.
                if (avatarEditorRef && avatarEditorRef.current) {
                  const editedAvatar = avatarEditorRef.current.getImage();
                  await userDB.setAvatar(editedAvatar);
                }

                await userDB.setAvatarOrig(avatar.avatarOrig);
                await userDB.setAvatarAltText(avatar.avatarAltText);
                await userDB.setAvatarPosition(avatar.avatarPosition);
                await userDB.setAvatarRotate(avatar.avatarRotate);
                await userDB.setAvatarScale(avatar.avatarScale);

                const newUser = await userDB.loggedInUser();


                setUser({...newUser});

                toast("Profile Updated", {type: 'success'});
                

                // The Effect will detect that the user state variable has
                // changed and rerender this with a clean slate, so we don't
                // have to manually run resetAvatar.
                onClose();
              }}>
                Save
              </Button>

              <Button variant="solid" color="danger" onPress={() => { 
                // If they haven't touched the avatar (no draft exists), let them cancel without confirming.
                if (!avatarEditingState.avatarDraft || confirm("Cancel your changes to your avatar and lose your work?")) { 
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

        <Input name="name" isRequired className="my-4" label="Display Name" type="text" 
          placeholder="Your Name" ref={nameInputRef} 
          autoComplete="name"
          value={nameInputValue}
          onValueChange={value => setNameInputValue(value)}
          validate={value => { 
            if (value) { 
              return null; 
            } else {
              return "Display Name is required" ;
            }
          }}
        />

        <Textarea name="bio" ref={bioInputRef} 
          className="my-4"
          label="Bio"
          placeholder="Tell people a little about yourself." 
          defaultValue={user? user.bio : ""}
        />
      </div>

      <Button type="submit" isDisabled={nameInputValue.length===0} radius="full" color="primary">Save</Button>
    </Form>
    </main>
  </>;
}
