import { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Link as Link2 } from "@nextui-org/link"
import { useDisclosure } from "@nextui-org/use-disclosure"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";

import DarkModeContext from "./DarkModeContext.jsx";
import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'

import './static/ImageList.css'

export default function ImageList({post}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const [darkMode, setDarkMode] = useContext(DarkModeContext);

  const imageBucket = postsDB.getImagesForPost(post.uri, post.updatedAt);

  if (!imageBucket || Object.keys(imageBucket).length <= 0) { return ""; }

  return (
    <div className="post-images">
      <ul className={"post-images "+(Object.keys(imageBucket).length > 1? "grid grid-cols-2" : "")}>
        {Object.entries(imageBucket).map(([fileName, {data: imageData, altText, altTextLang}]) => {
          return ( <li key={fileName}><ClickableImage fileName={fileName} imageData={imageData} altTextLang={altTextLang} altText={altText} darkMode={darkMode} /></li> );
        })}
      </ul>
    </div>
  );
}

function ClickableImage({fileName, imageData, altText, altTextLang, darkMode}) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  return (
    <>
    <Link2 onPress={onOpen}>
      <img src={imageData} lang={altTextLang} alt={altText} className="h-[200px] object-cover" />
    </Link2> 

    <Modal isOpen={isOpen} onOpenChange={onOpenChange}
          className={(darkMode? "dark" : "")+" max-h-screen overflow-y-auto text-foreground bg-background"}
    >
      <ModalContent>
        {(onClose) => 
          <>
          <ModalBody>
            <Link2 href={imageData} isExternal><img src={imageData} lang={altTextLang} alt={altText} /></Link2>
            {altText? <div className="whitespace-pre-line" lang={altTextLang}>{altText}</div> : ""}
          </ModalBody>
          </>
        }
      </ModalContent>
    </Modal>
    </>
  );
}
