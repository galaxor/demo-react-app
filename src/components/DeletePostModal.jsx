import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";
import {useContext} from 'react'

import DarkModeContext from "../DarkModeContext.jsx";

function deletePost(post, onClose) {
  alert("Not implemented");
  onClose();
}

export default function DeletePostModal({isOpen, onOpen, onOpenChange, post}) {
  const [darkMode, setDarkMode] = useContext(DarkModeContext);
  return (
    <>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className={(darkMode? "dark" : "")}>
      <ModalContent>
        {onClose => {
          return (<>
          <ModalHeader className="text-foreground">Really delete?</ModalHeader>
          <ModalBody className="text-foreground">Are you sure you want to delete the post?</ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="danger" onPress={e => deletePost(post, onClose)}>Delete</Button>
          </ModalFooter>
          </>);
        }}
      </ModalContent>
    </Modal>
    </>
  );
}
