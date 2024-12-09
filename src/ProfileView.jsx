import { Button } from "@nextui-org/button"
import {Divider} from "@nextui-org/divider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import { useContext } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation, useLoaderData, useMatches } from "react-router-dom";
import { Link as Link2 } from "@nextui-org/link"
import {Tabs, Tab} from "@nextui-org/tabs";
import { useDisclosure } from "@nextui-org/use-disclosure"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/modal";

import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import DatabaseContext from './DatabaseContext.jsx';
import FollowInfoContext from './FollowInfoContext.jsx';
import FriendStatus from './FriendStatus.jsx';
import icons from './icons.js'
import LogoutLink from './LogoutLink.jsx';
import PersonContext from './PersonContext.jsx';
import ProfileBio from './ProfileBio.jsx';
import { PeopleDB } from './logic/people.js';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import './static/ProfileView.css'

export default function ProfileView({handle, loggedInUser, children }) {
  const { user } = useContext(UserContext);

  const loaderData = useLoaderData();
  const loadedPerson = loaderData? loaderData.person : null;

  let person;
  if (loggedInUser) {
    person = user;
  } else {
    person = loadedPerson;
  }

  const matches = useMatches();

  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);
  const whoFollowsThem = peopleDB.whoFollowsThem(person.handle);
  const whoDoTheyFollow = peopleDB.whoDoTheyFollow(person.handle);

  // This condition happens if we're supposed to be looking at the logged in
  // user, but they haven't loaded yet.
  if (loggedInUser && person === null) {
    // This is where we would draw a throbber, probably, if the database was actually asynchronous.
    return "";
  }

  const onHomeServer = (person.localUserId !== null); 

  const isYou = (user && user.handle === person.handle);

  const avatarFallbackColor = hashSum(person.handle).substring(0,6).toUpperCase();

  const displayName = <>
    <div className="display-name text-3xl p-name font-bold flex items-center text-primary hover:underline">
      <bdi>{person.displayName}</bdi>
      {isYou || onHomeServer? 
        <span className="trust-info ml-2">
          {isYou && <span className="is-you">(You)</span>}
          {onHomeServer && <span className="trust-on-this-server ml-1"><FontAwesomeIcon icon={icons.house} title="From this server" size="sm" /></span>}
        </span>
        : ""
      }
    </div>
    </>;

  const loc = useLocation();

  const activeTab = ( loc.pathname.match(/^\/profile/)?
    loc.pathname.replace(/^\/profile(\/[^\/]*)?/, '$1')
    : loc.pathname.replace(/^\/people\/([^\/]*)(\/([^\/]*))?/, '$3')
    ) || "posts"
  ;

  const avatarDisclosure = useDisclosure();
    // It has these elements.
    // I just didn't want such vague names in the namespace.
    // const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <main className="h-card profile-view">
      <h1 className="mb-8 flex gap-5 items-center">
        <Link2 onPress={avatarDisclosure.onOpen}>
          <Avatar isBordered radius="full" className="text-large w-[100px] h-[100px]" src={person.avatar} 
            name={person.displayName} 
            alt={person.avatarAltText}
            style={{'--avatar-bg': '#'+avatarFallbackColor}}
            classNames={{base: "bg-[--avatar-bg]"}}
          />
        </Link2>
        <Modal isOpen={avatarDisclosure.isOpen} onOpenChange={avatarDisclosure.onOpenChange}>
          <ModalContent>
            {(onClose) => 
              <>
              <ModalBody>
                <Link2 href={person.avatar} isExternal><img src={person.avatar} alt={person.avatarAltText} /></Link2>
                {person.avatarAltText? <div className="whitespace-pre-line">{person.avatarAltText}</div> : ""}
              </ModalBody>
              </>
            }
          </ModalContent>
        </Modal>
        <div className="name-and-handle flex-rows">
          {person.localUserId?
            <Link2 className="u-url block" href={'/person/'+handle}>
              {displayName}
            </Link2>
            :
            <a className="u-url link-external flex gap-5 items-center" rel="noopener noreferrer" target="_blank" href={person.url}>
              {displayName}
            </a>
          }
          <Link2 className="author-handle u-impp font-bold text-default-1000"
            onPress={async () => {
              await navigator.clipboard.writeText(person.handle);
            }}
          >
            {person.handle}
            <FontAwesomeIcon className="ml-1" icon={icons.copy} title="Copy this handle to the clipboard" />
          </Link2>
        </div>
      </h1>

      <SystemNotificationArea />

      <section className="actions mb-4">
        <h2 className="visually-hidden">Follow Info</h2>
        {user && !isYou && <FriendStatus person={person} />}

        {isYou && <Button className="edit-your-profile" to="/profile/edit" as={Link2} 
          variant="solid" color="primary" radius="full"
          startContent={<FontAwesomeIcon icon={icons.fileLines} />}>
            Edit Profile
          </Button>}
        {isYou && <LogoutLink />}
      </section>

      <PersonContext.Provider value={person}>
        <ProfileBio />

        <Divider className="my-4" />

        <nav className="navigation-tabs" aria-labelledby="navigation">
          <h2 id="navigation" className="visually-hidden">Navigation</h2>
          <Tabs size="sm" selectedKey={activeTab} aria-labelledby="navigation">
            <Tab key="posts" href={"/people/"+person.handle} title="Posts" />
            <Tab key="posts-replies" href={'/people/'+person.handle+'/posts-replies'} title="Posts & Replies" />
            <Tab key="followers" href={'/people/'+person.handle+'/followers'} title={"Followers " + whoFollowsThem.length} />
            <Tab key="follows" href={'/people/'+person.handle+'/follows'} title={"Follows "+whoDoTheyFollow.length} />
          </Tabs>
        </nav>
        
        <FollowInfoContext.Provider value={ { whoDoTheyFollow, whoFollowsThem } }>
          {children? children : ''}
          <Outlet />
        </FollowInfoContext.Provider>
      </PersonContext.Provider>
    </main>
  );
}
