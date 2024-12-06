import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/dropdown";
import { Link } from 'react-router-dom'
import { useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import icons from './icons.js'


function getDropdownAction(originalLink) {
  function dropdownAction(key) {
    if (key === "open-original") {
      if (originalLink.current) {
        originalLink.current.click();
      }
    }
  }
}

export default function PostDetailsMenu({post}) {
  const originalLink = useRef(null);


  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          <FontAwesomeIcon icon={icons.ellipsis} title="Details" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Post Details" variant="solid" color="primary"
        onAction={getDropdownAction(originalLink)}
      >
        <DropdownSection showDivider>
          <DropdownItem key="open-original" textValue="Open original post"><a ref={originalLink} href={post.canonicalUrl} target="_blank">Open original post</a></DropdownItem>
          <DropdownItem key="copy-link-to-original">Copy link to original post</DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="reaction-details" href={"/post/"+encodeURIComponent(post.uri)+"/reactions"}>Reaction details</DropdownItem>
          <DropdownItem key="boost-details" href={"/post/"+encodeURIComponent(post.uri)+"/boosts"}>Boost details</DropdownItem>
          <DropdownItem key="quote-boost-details" href={"/post/"+encodeURIComponent(post.uri)+"/quote-boosts"}>Quote boost details</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
