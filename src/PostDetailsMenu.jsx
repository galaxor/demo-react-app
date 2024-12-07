import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/dropdown";
import { Link } from 'react-router-dom'
import { Link as Link2, LinkIcon } from "@nextui-org/link"
import { useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import icons from './icons.js'


function getDropdownAction(originalLink) {
  return function dropdownAction(key) {
    if (key === "open-original") {
      if (originalLink.current) {
        if (!originalLink.current.dataset.clicked) {
          originalLink.current.click();
        }
        originalLink.current.dataset.clicked = false;
      }
    }
  }
}

export default function PostDetailsMenu({post}) {
  const originalLink = useRef(null);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light">
          <FontAwesomeIcon icon={icons.ellipsis} title="Details" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Post Details" variant="solid" color="primary"
        onAction={getDropdownAction(originalLink)}
      >
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
  );
}
