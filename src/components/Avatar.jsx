import {Avatar as UIAvatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import hashSum from 'hash-sum'
import { useContext, useEffect, useRef, useState } from 'react'

import DatabaseContext from '../DatabaseContext.jsx';

export default function Avatar({imageHash, handle, name, className}) {
  const db = useContext(DatabaseContext);

  const [imgSrc, setImgSrc] = useState("");
  
  useEffect(() => {
    (async () => {
      if (typeof imageHash !== "undefined" && imageHash !== null) {
        setImgSrc(await db.getImageDataUrl(imageHash));
      }
    })();
  }, []);
  
  const avatarFallbackColor = hashSum(handle).substring(0,6).toUpperCase();

  const avatarRef = useRef(null);

  return (
    <UIAvatar isBordered ref={avatarRef} radius="full" size="md" className={`shrink-0 ${className ?? ""}`} src={imgSrc} name={name} 
      style={{'--avatar-bg': '#'+avatarFallbackColor}}
      classNames={{base: "avatar bg-[--avatar-bg]", img: "opacity-100"}}
    />
  );
}
