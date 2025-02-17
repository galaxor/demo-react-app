import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";
import { useContext, useState, useEffect } from 'react'
import { Link as Link2 } from "@nextui-org/link"
import { useDisclosure } from "@nextui-org/use-disclosure"

import DarkModeContext from "../DarkModeContext.jsx";
import DatabaseContext from '../DatabaseContext.jsx'

export default function ClickableImage({fileName, imageHash, altText, altTextLang}) {
  const [darkMode, setDarkMode] = useContext(DarkModeContext);
  const [imageData, setImageData] = useState(undefined);

  const db = useContext(DatabaseContext);

  useEffect(() => {
    (async () => {
      setImageData(await db.getImageDataUrl(imageHash));
    })();
  }, []);

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
