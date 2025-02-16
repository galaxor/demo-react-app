import {Avatar as UIAvatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import hashSum from 'hash-sum'
import { useContext, useEffect, useRef, useState } from 'react'

import DatabaseContext from '../DatabaseContext.jsx';

export default function Avatar({imageHash, handle, name}) {
  const db = useContext(DatabaseContext);

  const [imgSrc, setImgSrc] = useState("");
  const [urlsToRevoke, setUrlsToRevoke] = useState([]);
  
  useEffect(() => {
    (async () => {
      if (imgSrc === "" && typeof imageHash !== "undefined") {
        const objUrl = await db.getImageObjectUrl(imageHash);
        setImgSrc(objUrl);
        setUrlsToRevoke([...urlsToRevoke, objUrl]);
      }
    })();
  }, []);

  useEffect(() => {
    if (urlsToRevoke.length > 0) {
      for (const objUrl of urlsToRevoke) {
        URL.revokeObjectURL(objUrl);
      }
      setUrlsToRevoke([]);
    }
  }, [urlsToRevoke]);
  
  const avatarFallbackColor = hashSum(handle).substring(0,6).toUpperCase();

  const avatarRef = useRef(null);
  
  return (
    <UIAvatar isBordered ref={avatarRef} radius="full" size="md" className="shrink-0" src={imgSrc} name={name} 
      style={{'--avatar-bg': '#'+avatarFallbackColor}}
      classNames={{base: "bg-[--avatar-bg]", img: "opacity-100"}}
    />
  );
}
