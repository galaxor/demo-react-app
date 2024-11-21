import { useContext, useEffect, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';

import InputSlider from './InputSlider.jsx';

import UserContext from './UserContext.jsx';

import './static/AvatarUpload.css';

export default function AvatarUpload({onChange, getImageRef}) {
  const { user } = useContext(UserContext);

  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [avatarEdited, setAvatarEdited] = useState(user? user.avatar : null);
  const [avatarOrig, setAvatarOrig] = useState(user? user.avatarOrig : null);
  const [avatarAltText, setAvatarAltText] = useState(null);
  const [avatarPosition, setAvatarPosition] = useState(null);
  const [avatarRotate, setAvatarRotate] = useState(null);
  const [avatarScale, setAvatarScale] = useState(null);

  const avatarEditorRef = useRef({});

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
  }, [avatarOrig, avatarAltText, avatarPosition, avatarRotate, avatarScale, removeAvatar]);

  return (
    <div className="avatar-editor">
      <div id="avatar-preview" className="avatar-upload">
        <div className="avatar-preview-bar">
          {avatarOrig && removeAvatar? 
            ''
            :
            <>
            <input type="file" id="avatar-input" name="avatar"
              accept="image/*"
              autoComplete="photo"
              onChange={avatarUpload}
            />
            {avatarOrig?
              <label htmlFor="avatar-input" className="avatar-preview">
                <img alt="" src={avatarEdited} id="avatar-preview-img" />
              </label>
              :
              ''
            }

            <label htmlFor="avatar-input" className="avatar-upload-box">📷<br />{avatarOrig? "Replace Image" : "Upload Image"}</label>
            </>
          }

          {avatarOrig?
            <div className="remove-avatar">
              <input id="remove-avatar-checkbox" type="checkbox" checked={removeAvatar}
                onChange={(e) => {
                  setRemoveAvatar(e.target.checked);
                }} />
              <label htmlFor="remove-avatar-checkbox" className="no-avatar">Remove avatar</label>
            </div>
            :
            ''
          }
        </div>
      </div>

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

      {avatarOrig && !removeAvatar ?
        <AvatarAltText
          avatarAltText={avatarAltText}
          setAvatarAltText={setAvatarAltText}
        />
      :
      ""
    }
    </div>
  );
}

function AvatarEditorSection({avatarEditorRef, avatarOrig, setAvatarOrig, avatarScale, setAvatarScale, avatarRotate, setAvatarRotate, avatarPosition, setAvatarPosition, getImageFn, avatarEdited, setAvatarEdited}) {
  return (
    <div>
      <div>
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
        shiftStep={0.1}
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
    <label htmlFor="avatar-alt-input">Avatar Alt Text</label>
    <textarea id="avatar-alt-input" name="avatar-alt"
        value={avatarAltText ?? ""}
        onChange = {(e) => setAvatarAltText(e.target.value)}
    />
    </>
  );
}
