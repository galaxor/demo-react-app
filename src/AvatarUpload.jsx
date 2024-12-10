import AvatarEditor from 'react-avatar-editor';
import { Button } from "@nextui-org/button"
import {Checkbox} from "@nextui-org/checkbox";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import { useContext, useEffect, useRef, useState } from 'react';

import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import {Textarea} from "@nextui-org/input";
import InputSlider from './InputSlider.jsx';

import icons from './icons.js'
import UserContext from './UserContext.jsx';

import './static/AvatarUpload.css';

export default function AvatarUpload({onChange, getImageRef}) {
  const { user } = useContext(UserContext);

  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [avatarEdited, setAvatarEdited] = useState(user? user.avatar : null);
  const [avatarOrig, setAvatarOrig] = useState(user? user.avatarOrig : null);
  const [avatarAltText, setAvatarAltText] = useState("");
  const [avatarPosition, setAvatarPosition] = useState({x: 0.5, y: 0.5});
  const [avatarRotate, setAvatarRotate] = useState(0);
  const [avatarScale, setAvatarScale] = useState(1);

  const avatarFallbackColor = hashSum(user.handle).substring(0,6).toUpperCase();

  const avatarEditorRef = useRef({});
  const fileUploadRef = useRef(null);
  const removeAvatarCheckboxRef = useRef(null);

  const getImageFn = function () {
    if (avatarEditorRef && avatarEditorRef.current && avatarEditorRef.current.getImageScaledToCanvas) {
      const image = avatarEditorRef.current.getImageScaledToCanvas().toDataURL();
      return image;
    } else {
      return null;
    }
  }
  getImageRef.current.getImage = getImageFn;

  function avatarUpload(e) {
    setRemoveAvatar(false);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const avatarOrig = reader.result;

      setAvatarOrig(avatarOrig);
      setAvatarPosition({x: 0, y: 0});
      setAvatarRotate(0);
      setAvatarScale(1);
    });

    reader.readAsDataURL(e.target.files[0]);
  }

  // When you first load the page, the previews will be empty.
  // Load them with the saved values.
  useEffect(() => {
    if (user) {
      setAvatarOrig(user.avatarOrig);
      setAvatarAltText(user.avatarAltText);
      setAvatarPosition(user.avatarPosition);
      setAvatarRotate(user.avatarRotate);
      setAvatarScale(user.avatarScale);
    }
  }, [user]);

  // This is how we export the changes:  Let them pass us an onChange hook, and
  // then when any of these values changes, we ship it out to the hook.
  useEffect(() => {
    if (typeof onChange === 'function') {
      if (removeAvatar) {
        onChange({avatarOrig: null, avatarAltText: null, avatarPosition: {x: 0, y: 0}, avatarRotate: 0, avatarScale: 1});
      } else {
        onChange({avatarOrig: avatarOrig, avatarAltText: avatarAltText, avatarPosition: avatarPosition, avatarRotate: avatarRotate, avatarScale: avatarScale});
      }
    }
  }, [avatarOrig, avatarAltText, avatarPosition, avatarRotate, avatarScale, removeAvatar, onChange]);

  return (
    <div className={'avatar-editor '+(avatarOrig && !removeAvatar? 'avatar-editor-open' : '') }>
      <div id="avatar-preview" className="avatar-upload">
        <div className="avatar-preview-bar flex gap-5 my-5 items-center justify-normal">
          {avatarOrig && removeAvatar? 
            ''
            :
            <>
            {avatarOrig?
              <label htmlFor="avatar-input" className="avatar-preview">
                <Avatar isBordered radius="full" size="lg" className="shrink-0" src={avatarEdited} name="Image preview"
                  style={{'--avatar-bg': '#'+avatarFallbackColor}}
                  classNames={{base: "bg-[--avatar-bg] w-[75px] h-[75px] "}}
                />
              </label>
              :
              ''
            }

            <label className="avatar-upload-box">
              <input type="file" id="avatar-input" className="avatar-input" name="avatar"
                ref={fileUploadRef}
                className="visually-hidden"
                accept="image/*"
                autoComplete="photo"
                onChange={avatarUpload}
              />
              <Button className="w-[80px] h-[75px] text-wrap" onPress={e => fileUploadRef.current.click()}>
                📷
                <br />{avatarOrig? "Replace Image" : "Upload Image"}
              </Button>
            </label>
            </>
          }

          {avatarOrig?
            <Checkbox id="remove-avatar-checkbox" ref={removeAvatarCheckboxRef} checked={removeAvatar} 
              classNames={{
                base:
                  "block bg-content1 w-[80px] h-[75px] text-center p-1 " +
                  "hover:bg-content2 " +
                  "cursor-pointer rounded-lg border-2 border-transparent " +
                  "data-[selected=true]:border-primary"
                ,
                wrapper: "block mx-auto",
                label: "block text-wrap text-sm",
              }}
              onChange={(e) => {
                setRemoveAvatar(e.target.checked);
              }}
            >
              Remove Image
            </Checkbox>
            :
            ''
          }
        </div>
      </div>

      {avatarOrig && !removeAvatar ?
        <AvatarAltText
          avatarAltText={avatarAltText}
          setAvatarAltText={setAvatarAltText}
        />
      :
      ""
      }

      {avatarOrig && !removeAvatar ?
        <AvatarEditorSection
          avatarEditorRef={avatarEditorRef}
          avatarOrig={avatarOrig}
          setAvatarOrig={setAvatarOrig}
          avatarScale={avatarScale}
          setAvatarScale={setAvatarScale}
          avatarRotate={avatarRotate}
          setAvatarRotate={setAvatarRotate}
          avatarPosition={avatarPosition}
          setAvatarPosition={setAvatarPosition}
          getImageFn={getImageFn}
          avatarEdited={avatarEdited}
          setAvatarEdited={setAvatarEdited}
        />
        :
        ''
      }

    </div>
  );
}

function AvatarEditorSection({avatarEditorRef, avatarOrig, setAvatarOrig, avatarScale, setAvatarScale, avatarRotate, setAvatarRotate, avatarPosition, setAvatarPosition, getImageFn, avatarEdited, setAvatarEdited}) {
  const [panFocused, setPanFocused] = useState(false);

  useEffect(() => {
    function handleArrowKeys(e) {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const {x, y} = avatarPosition;

        const moveAmount=0.05;
        var newAvatarPosition;

        switch(e.key) {
        case "ArrowDown": newAvatarPosition = {...avatarPosition, y: y+moveAmount}; break;
        case "ArrowUp": newAvatarPosition = {...avatarPosition, y: y-moveAmount}; break;
        case "ArrowLeft": newAvatarPosition = {...avatarPosition, x: x-moveAmount}; break;
        case "ArrowRight": newAvatarPosition = {...avatarPosition, x: x+moveAmount}; break;
        }

        setAvatarPosition(newAvatarPosition);
      }
    }

    if (panFocused) {
      window.addEventListener('keydown', handleArrowKeys);
    }

    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [avatarPosition, setAvatarPosition, panFocused]);

  return (
    <div>
      <div 
        tabIndex={0} 
        onFocus={() => setPanFocused(true)}
        onBlur={() => setPanFocused(false)}>
        {panFocused?
          <span className="four-arrows" aria-label="Use arrow keys to move the image around">✢</span>
          :
          ""
        }
        <AvatarEditor
          ref={avatarEditorRef}
          image={avatarOrig}
          width={250}
          height={250}
          border={0}
          color={[255, 255, 255, 0.6]} // RGBA
          borderRadius={125}
          scale={avatarScale}
          rotate={avatarRotate}
          position={avatarPosition}
          onPositionChange={newPos => {
            setAvatarPosition({...newPos});
            setAvatarEdited(getImageFn());
          }}
          onImageReady={() => setAvatarEdited(getImageFn())}
          onImageChange={() => setAvatarEdited(getImageFn())}
        />
      </div>
      <div>
      <InputSlider
        label="Scale"
        name="avatar-scale"
        id="avatar-scale"
        min={1}
        max={3}
        value={avatarScale}
        setValue={setAvatarScale}
        step={0.1}
        onChange={(e, value) => setAvatarScale(value)}
      />
      <InputSlider
        label="Rotate (degrees)"
        name="avatar-rotate"
        id="avatar-rotate"
        min={-180}
        max={180}
        marks={[{value: 0, label: "0°"}]}
        value={avatarRotate}
        setValue={setAvatarRotate}
        shiftStep={5}
        step={5}
        onChange={(e, value) => setAvatarRotate(value)}
      />
      </div>
    </div>
  );
}

function AvatarAltText({avatarAltText, setAvatarAltText}) {
  return (
    <>
    <Textarea name="avatar-alt" label="Alt Text"
        value={avatarAltText ?? ""}
        placeholder="Describe the image as if you're talking to someone who can't see it."
        onChange = {(e) => setAvatarAltText(e.target.value)}
        className="mb-3"
    />
    </>
  );
}
