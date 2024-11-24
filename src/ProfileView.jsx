import { useContext } from 'react';
import { Link, useLoaderData } from "react-router-dom";

import FriendStatus from './FriendStatus.jsx';
import PostsByPerson from './PostsByPerson.jsx';
import ProfileBio from './ProfileBio.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';
import WhoDoTheyFollow from './WhoDoTheyFollow.jsx';
import WhoFollowsThem from './WhoFollowsThem.jsx';

import './static/ProfileView.css'

export default function ProfileView({handle, loggedInUser }) {
  const { user } = useContext(UserContext);

  const loaderData = useLoaderData();
  const loadedPerson = loaderData? loaderData.person : null;

  let person;
  if (loggedInUser) {
    person = user;
  } else {
    person = loadedPerson;
  }

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
            <span className="display-name p-name"><bdi>{person.displayName}</bdi></span> {" "}
            <span className="author-handle u-impp">{person.handle}</span>
          </Link>
          :
          <a className="u-url link-external" rel="noopener noreferrer" target="_blank" href={person.url}>
            <span className="display-name p-name"><bdi>{person.displayName}</bdi></span>
            <span className="author-handle u-impp">{person.handle}</span>
          </a>
        }
        {" "}
        {isYou && <span className="is-you">(You)</span>}
      </h1>

      <SystemNotificationArea />

      {onHomeServer && <span className="trust-on-this-server">From this server.</span>} {" "}

      {!isYou && <FriendStatus person={person} />}

      {isYou && <Link className="edit-your-profile" to="/profile/edit">Edit Profile</Link>}

      {person.avatar &&
        <>
        <h2>Avatar</h2>

        <a rel="noopener noreferrer" target="_blank" href={person.url} aria-label={person.displayName + ' ' + person.handle}><img className="avatar-large u-photo" src={person.avatar} alt={person.avatarAltText} /></a>
        </>
      }

      <ProfileBio person={person} />

      <WhoFollowsThem person={person} />
      <WhoDoTheyFollow person={person} />

      <PostsByPerson person={person} />
    </main>
  );
}
