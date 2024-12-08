import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import DatabaseContext from './DatabaseContext.jsx';
import icons from './icons.js'
import UserContext from './UserContext.jsx';
import { PeopleDB } from './logic/people.js';

import './static/Person.css'

export default function PersonInline({person, onClick, onHover, onUnHover}) {
  // XXX I'm not implementing hover and unhover right now, so I want the linter to yell at me about it.
  // The thing is, React doesn't have a notion of "hover".  You have to use a
  // combination of mouseEnter, mouseLeave, focus, and blur.  The logic is not
  // trivial and it's not what I want to focus on right now.
  // See this blog post: https://dev.to/writech/how-to-handle-the-mouse-hover-event-in-react-h7h
  // Although the blog post doesn't cover dealing with focus, so they made a mouse-only thing!
  // (hmmm, also what about phones?  Hover and focus aren't the best things to
  // do, for them.  We'd need some kind of long-press handler, maybe?  Or some kind of "info" toggle they can click.)

  // The point of all this hover stuff is I want to be able to show only the
  // display name, but have some kind of tooltip to say what server they're
  // from.

  const avatarFallbackColor = hashSum(person.handle).substring(0,6).toUpperCase();

  const { user } = useContext(UserContext);

  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);

  // Important states to note, so the user can make decisions about how much
  // they trust this user.
  // Things to note:
  // * You follow them
  // * They are on your home server

  // XXX One day, we should have a way to note when two people with the same
  // display name appear on the same page, and give them numbers:  "Pam 1 said
  // this, Pam 2 said that".

  const isYou = (user && user.handle === person.handle);
  const youFollowThem = (user === null || isYou)? false : peopleDB.doesXFollowY(user.handle, person.handle);
  const onHomeServer = (person.localUserId !== null); 

  return (
    <Link className="person-inline h-card" onClick={onClick} to={'/people/'+person.handle}>
      <div className="flex gap-2">
        <Avatar isBordered radius="full" size="md" className="shrink-0" src={person.avatar} name={person.displayName} 
          style={{'--avatar-bg': '#'+avatarFallbackColor}}
          classNames={{base: "bg-[--avatar-bg]"}}
        />
        {" "}
        <div className="name-handle flex flex-col items-start justify-center">
          <bdi className="p-name">{person.displayName}</bdi> {" "}
          <span className="handle-and-trust flex gap-1">
            <span className="handle-inline u-impp order-2">{person.handle}</span>
            <span className="person-inline-trust-info">
              {isYou && <span className="is-you">You</span>} {" "}
              {onHomeServer && <span className="trust-on-this-server">
                  <FontAwesomeIcon title="From this server" icon={icons.house} />
                </span>
              } {" "}
              {youFollowThem && <span className="trust-you-follow-them" aria-label="You follow them">
                  <FontAwesomeIcon title="You follow them" icon={icons.flag} />
                </span>
              }
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
