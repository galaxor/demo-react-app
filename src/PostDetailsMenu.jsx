import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/dropdown";
import { useDisclosure } from "@nextui-org/use-disclosure"
import { Link } from 'react-router-dom'
import { Link as Link2, LinkIcon } from "@nextui-org/link"
import { useContext, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import DeletePostModal from './components/DeletePostModal.jsx'
import icons from './icons.js'
import UserContext from './UserContext.jsx'


function getDropdownAction(originalLink, deleteModalOnOpen) {
  return async function dropdownAction(key) {
    switch(key) {
    case "open-original":
      if (originalLink.current) {
        if (!originalLink.current.dataset.clicked) {
          originalLink.current.click();
        }
        originalLink.current.dataset.clicked = false;
      }
      break;

    case "copy-link-to-original":
      try {
        await navigator.clipboard.writeText(originalLink.current.href);
        console.log("I should put a Toast for this.  Toasts aren't available in NextUI yet, so I'll use a Radix component: https://www.radix-ui.com/primitives/docs/components/toast");
      } catch(error) {
        console.log("Copying to clipboard", error);
      }
      break;

    case "delete-post":
      deleteModalOnOpen();
      break;
    }
  }
}

export default function PostDetailsMenu({post}) {
  const originalLink = useRef(null);
  const { user } = useContext(UserContext);
  const {
    isOpen: deleteModalIsOpen,
    onOpen: deleteModalOnOpen,
    onOpenChange: deleteModalOnOpenChange,
  } = useDisclosure();

  return (<>
    {(typeof user !== "undefined" && post.authorPerson.handle === user.handle)?
      <DeletePostModal isOpen={deleteModalIsOpen} onOpen={deleteModalOnOpen} onOpenChange={deleteModalOnOpenChange} post={post} />
      : ""
    }

    <Dropdown>
      <DropdownTrigger>
        <Button variant="light">
          <FontAwesomeIcon icon={icons.ellipsis} title="Details" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Post Details" variant="solid" color="primary"
        onAction={getDropdownAction(originalLink, deleteModalOnOpen)}
      >
      {(typeof user !== "undefined" && post.authorPerson.handle === user.handle)?
        <DropdownSection showDivider>
          <DropdownItem key="delete-post" textValue="Delete Post" className="text-danger">Delete Post</DropdownItem>
        </DropdownSection>
        :
        ""
      }
        <DropdownSection showDivider>
          <DropdownItem key="open-original" textValue="Open original" endContent={<LinkIcon />}><a ref={originalLink} href={post.canonicalUrl} onClick={e => { originalLink.current.dataset.clicked=true; }} target="_blank" rel="noopener noreferrer">Open original post</a></DropdownItem>
          <DropdownItem key="copy-link-to-original">Copy link to original post</DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="reply-details" href={"/post/"+encodeURIComponent(post.uri)}>Go to thread</DropdownItem>
          <DropdownItem key="reaction-details" href={"/post/"+encodeURIComponent(post.uri)+"/reactions"}>Reaction details</DropdownItem>
          <DropdownItem key="boost-details" href={"/post/"+encodeURIComponent(post.uri)+"/boosts"}>Boost details</DropdownItem>
          <DropdownItem key="quote-boost-details" href={"/post/"+encodeURIComponent(post.uri)+"/quote-boosts"}>Quote boost details</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
    </>
  );
}
