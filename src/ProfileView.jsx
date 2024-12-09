import { Button } from "@nextui-org/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import { useContext } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation, useLoaderData, useMatches } from "react-router-dom";
import { Link as Link2 } from "@nextui-org/link"
import {Tabs, Tab} from "@nextui-org/tabs";

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

  const nameAndAvatar = <>
    <Avatar isBordered radius="full" className="text-large w-[100px] h-[100px]" src={person.avatar} 
      name={person.displayName} 
      alt={person.avatarAltText}
      style={{'--avatar-bg': '#'+avatarFallbackColor}}
      classNames={{base: "bg-[--avatar-bg]"}}
    />
    <div className="name-handle text-3xl">
      <div className="display-name p-name font-bold flex items-center"><bdi>{person.displayName}</bdi>
        {isYou || onHomeServer? 
          <span className="trust-info ml-2">
            {isYou && <span className="is-you">(You)</span>}
            {onHomeServer && <span className="trust-on-this-server ml-1"><FontAwesomeIcon icon={icons.house} title="From this server" size="sm" /></span>}
          </span>
          : ""
        }
      </div>
      <div className="author-handle u-impp text-primary">{person.handle}</div>
    </div>
    </>;

  const loc = useLocation();

  const activeTab = ( loc.pathname.match(/^\/profile/)?
    loc.pathname.replace(/^\/profile(\/[^\/]*)?/, '$1')
    : loc.pathname.replace(/^\/people\/([^\/]*)(\/([^\/]*))?/, '$3')
    ) || "posts"
  ;

  console.log("TK", activeTab);

  return (
    <main className="h-card profile-view">
      <h1 className="mb-8">
        {person.localUserId?
          <Link className="u-url block flex gap-5 items-center" href={'/person/'+handle}>
            {nameAndAvatar}
          </Link>
          :
          <a className="u-url link-external" rel="noopener noreferrer" target="_blank" href={person.url}>
            {nameAndAvatar}
          </a>
        }
        {" "}
      </h1>

      <SystemNotificationArea />

      <section className="actions">
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

        <nav className="navigation-tabs" aria-labelledby="navigation">
          <h2 id="navigation" className="visually-hidden">Navigation</h2>
          <Tabs selectedKey={activeTab} aria-labelledby="navigation">
            <Tab key="posts" href={"/people/"+person.handle}>Posts</Tab>
            <Tab key="posts-replies" href={'/people/'+person.handle+'/posts-replies'}>Posts &amp; Replies</Tab>
            <Tab key="followers" href={'/people/'+person.handle+'/followers'}>Followers {whoFollowsThem.length}</Tab>
            <Tab key="follows" href={'/people/'+person.handle+'/follows'}>Follows {whoDoTheyFollow.length}</Tab>
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
