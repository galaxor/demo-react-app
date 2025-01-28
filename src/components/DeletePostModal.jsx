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
import DatabaseContext from '../DatabaseContext'
import { PostsDB } from '../logic/posts.js'

function deletePost(postsDB, post, onClose, onDelete) {
  postsDB.deletePost(post.uri);

  onClose();

  if (typeof onDelete === "function") {
    onDelete();
  }
}

export default function DeletePostModal({isOpen, onOpen, onOpenChange, post, onDelete}) {
  const [darkMode, setDarkMode] = useContext(DarkModeContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

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
            <Button color="danger" onPress={e => deletePost(postsDB, post, onClose, onDelete)}>Delete</Button>
          </ModalFooter>
          </>);
        }}
      </ModalContent>
    </Modal>
    </>
  );
}
