import { useContext } from 'react';
import { Link, useLoaderData } from "react-router-dom";

import PeopleDB from './logic/people.js';
import UserContext from './UserContext.jsx';

import './static/ProfileView.css'

export function getPersonLoader(db) {
  return ({params}) => {
    const peopleDB = new PeopleDB(db);

    const person = peopleDB.get(params.handle);

    return { person };
  };
}

export function ProfileView({handle, loggedInUser }) {
  const { user } = useContext(UserContext);

  const loaderData = useLoaderData();
  const loadedPerson = loaderData? useLoaderData().person : null;

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

  return (
    <main className="h-card profile-view">
      <h1>
        {person.localUserId?
          <Link className="u-url" href={'/person/'+handle}>
            <span className="display-name p-name"><bdi>{person.displayName}</bdi></span>
            <span className="author-handle u-impp">{person.handle}</span>
          </Link>
          :
          <a className="u-url link-external" rel="noopener noreferrer" target="_blank" href={person.url}>
            <span className="display-name p-name"><bdi>{person.displayName}</bdi></span>
            <span className="author-handle u-impp">{person.handle}</span>
          </a>
        }
      </h1>

      <h2>Bio</h2>
      
      <div className="profile-bio">
        {person.bio}
      </div>

      {person.avatar &&
        <>
        <h2>Avatar</h2>

        <a rel="noopener noreferrer" target="_blank" href={person.url} aria-label={person.displayName + ' ' + person.handle}><img className="avatar-large u-photo" src={person.avatar} alt={person.avatarAltText} /></a>
        </>
      }
    </main>
  );
}
