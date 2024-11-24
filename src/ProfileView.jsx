import { useContext, useState } from 'react';
import { Link, useLoaderData } from "react-router-dom";

import { PeopleDB } from './logic/people.js';
import PersonInline from './PersonInline.jsx';
import DatabaseContext from './DatabaseContext.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx';

import './static/ProfileView.css'

export default function ProfileView({handle, loggedInUser }) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);


  const peopleDB = new PeopleDB(db);

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

  const [youFollowThem, setYouFollowThem] = useState();

  const theyFollowYou = user? peopleDB.doesXFollowY(person.handle, user.handle) : null;

  const whoFollowsThem = peopleDB.whoFollowsThem(person.handle);
  const whoDoTheyFollow = peopleDB.whoDoTheyFollow(person.handle);

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

      {onHomeServer && <span className="trust-on-this-server">From this server.</span>}

      {user !== null && 
        <aside className="profile-actions">
          <h2 id="profile-actions">Actions</h2>
          <nav aria-labelledby="profile-actions">
            <ul aria-labelledby="profile-actions">
              {isYou && <li><Link to="/profile/edit">Edit Profile</Link></li>}
              {!isYou &&
                <li id="friend-status">Friend Status
                  <ul className="friend-status" aria-labelledby="friend-status">
                    <li><label>
                      {(typeof youFollowThem === "undefined"? 
                            (user && peopleDB.doesXFollowY(user.handle, person.handle)) 
                            : youFollowThem)
                        ?
                        <> You follow <bdi>{person.displayName}</bdi> </>
                        :
                        <> Follow <bdi>{person.displayName}</bdi> </>
                      }

                      <input type="checkbox" 
                        checked={ 
                          typeof youFollowThem === "undefined"? 
                            (user && peopleDB.doesXFollowY(user.handle, person.handle)) 
                            : youFollowThem
                        }

                        onChange={(e) => {
                          if (e.target.checked) { peopleDB.follow(user.handle, person.handle); }
                          else { peopleDB.unfollow(user.handle, person.handle); }

                          setYouFollowThem(e.target.checked);
                        }} />
                    </label></li>

                    <li><label>
                      {theyFollowYou ?
                        <>
                        <bdi>{person.displayName}</bdi> follows you 
                          <input type="checkbox" disabled={true} checked={true} />
                        </>
                        :
                        <>
                        <bdi>{person.displayName}</bdi> does not follow you 
                          <input type="checkbox" disabled={true} checked={false} />
                        </>
                      }
                    </label></li>
                  </ul>
                </li>
              }
            </ul>
          </nav>
        </aside>
      }

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

      <aside className="follow-information">
        {/* We'll put the "who do they follow" thing first?  Or second? I can't decide. */}

        <section aria-labelledby="who-follows-them">
          <h2 id="who-follows-them">Who follows <bdi>{person.displayName}</bdi></h2>

          <ul aria-labelledby="who-follows-them">
          {whoFollowsThem.map(personWhoFollows => {
            return (<li key={personWhoFollows.handle}><PersonInline person={personWhoFollows} /></li>);
            }
          )}
          </ul>
        </section>

        <section aria-labelledby="who-do-they-follow">
          <h2 id="who-do-they-follow">Who does <bdi>{person.displayName}</bdi> follow?</h2>

          <ul aria-labelledby="who-do-they-follow">
          {whoDoTheyFollow.map(personWhoIsFollowed => {
            return (<li key={personWhoIsFollowed.handle}><PersonInline person={personWhoIsFollowed} /></li>);
            }
          )}
          </ul>
        </section>
      </aside>
    </main>
  );
}
