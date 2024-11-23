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

// Important states to note:
// * You follow them
// * They follow you (maybe not. We're trying to figure out if they're legit.  Whether they follow you is not important.  Bots and imitators can do that)
// * They are on your home server (maybe mention this?)

  const { user } = useContext(UserContext);

  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);

  const youFollowThem = (user === null)? false : peopleDB.doesXFollowY(user.handle, person.handle);

  return (
    <span className="person-inline">
      <Link className="person-inline h-card" onClick={onClick} to={'/people/'+person.handle}>
        {person.avatar && <img className="avatar-small u-photo" src={person.avatar} alt="" />} {" "}
        <bdi className="p-name">{person.displayName}</bdi> {" "}
        <span className="handle-inline u-impp">{person.handle}</span>
      </Link>
      <span className="person-inline-trust-info">
        {youFollowThem && <> You follow them </>}
      </span>
    </span>
  );
}
