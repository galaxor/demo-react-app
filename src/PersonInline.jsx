import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import DatabaseContext from './DatabaseContext.jsx';
import UserContext from './UserContext.jsx';
import { PeopleDB } from './logic/people.js';

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
    <span className="person-inline">
      <Link className="person-inline h-card" onClick={onClick} to={'/people/'+person.handle}>
        {person.avatar && <img className="avatar-small u-photo" src={person.avatar} alt="" />} {" "}
        <bdi className="p-name">{person.displayName}</bdi> {" "}
        <span className="handle-inline u-impp">{person.handle}</span>
      </Link>
      <span className="person-inline-trust-info">
        {isYou && <span className="is-you">You</span>} {" "}
        {youFollowThem && <span className="trust-you-follow-them">You follow them.</span>} {" "}
        {onHomeServer && <span className="trust-on-this-server">From this server.</span>}
      </span>
    </span>
  );
}