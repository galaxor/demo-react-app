import { useContext } from 'react';
import { Link, useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx';
import People from './logic/people.js';

import './static/ProfileView.css'

export function getPersonLoader(db) {
  return ({params}) => {
    const peopleDB = new People(db);

    const person = peopleDB.get(params.handle);

    return { person };
  };
}

export function ProfileView({handle}) {
  const { person } = useLoaderData();

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
