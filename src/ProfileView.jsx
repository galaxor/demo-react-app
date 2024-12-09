import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react';
import { Link, NavLink, Outlet, useLoaderData, useMatches } from "react-router-dom";

import Avatar from './Avatar.jsx'
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

  return (
    <main className="h-card profile-view">
      <h1>
        {person.localUserId?
          <Link className="u-url" href={'/person/'+handle}>
            <Avatar person={person} size="person-inline" /> {" "}
            <div className="name-handle">
              <span className="display-name p-name"><bdi>{person.displayName}</bdi></span> {" "}
              <span className="author-handle u-impp">{person.handle}</span>
            </div>
          </Link>
          :
          <a className="u-url link-external" rel="noopener noreferrer" target="_blank" href={person.url}>
            <Avatar person={person} size="person-inline" /> {" "}
            <div className="name-handle">
              <span className="display-name p-name"><bdi>{person.displayName}</bdi></span>
              <span className="author-handle u-impp">{person.handle}</span>
            </div>
          </a>
        }
        {" "}
      </h1>

      <SystemNotificationArea />

      {isYou || onHomeServer? 
        <section className="trust-info">
          {isYou && <span className="is-you">You</span>} {" "}

          {onHomeServer && <span className="trust-on-this-server"><FontAwesomeIcon icon={icons.house} title="From this server" size="lg" /></span>} {" "}
        </section>
        : ""
      }

      <section className="actions">
        {user && !isYou && <FriendStatus person={person} />}

        {isYou && <span className="button"><Link className="edit-your-profile" to="/profile/edit"><FontAwesomeIcon icon={icons.fileLines} />{" "}Edit Profile</Link></span>}
        {isYou && <LogoutLink />}
      </section>

      {person.avatar &&
        <>
        <h2 className="visually-hidden">Avatar</h2>

        <a rel="noopener noreferrer" target="_blank" href={person.url}><img className="avatar-large u-photo" src={person.avatar} alt={person.avatarAltText} /></a>
        </>
      }

      <PersonContext.Provider value={person}>
        <ProfileBio />

        <nav className="navigation-tabs" aria-labelledby="navigation">
          <h2 id="navigation" className="visually-hidden">Navigation</h2>
          <ul className="navigation-tabs" aria-labelledby="navigation">
            <li><NavLink className={(user && matches[matches.length-1].pathname=="/profile") ? 'active' : ''} to={"/people/"+person.handle} end>Posts</NavLink></li>
            <li><NavLink to={'/people/'+person.handle+'/posts-replies'}>Posts &amp; Replies</NavLink></li>
            <li><NavLink to={'/people/'+person.handle+'/followers'}>Followers<br />{whoFollowsThem.length}</NavLink></li>
            <li><NavLink to={'/people/'+person.handle+'/follows'}>Follows<br />{whoDoTheyFollow.length}</NavLink></li>
          </ul>
        </nav>
        
        <FollowInfoContext.Provider value={ { whoDoTheyFollow, whoFollowsThem } }>
          {children? children : ''}
          <Outlet />
        </FollowInfoContext.Provider>
      </PersonContext.Provider>
    </main>
  );
}
