import { useContext, useState } from 'react';
import { Link, useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx';
import FriendStatus from './FriendStatus.jsx';
import { PeopleDB } from './logic/people.js';
import PersonInline from './PersonInline.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';
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

  const postsDB = new PostsDB(db);
  const theirPosts = postsDB.getPostsBy(person.handle);

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

      <h2>Bio</h2>
      
      <div className="profile-bio">
        {person.bio}
      </div>

      <aside className="follow-information">
        {/* We'll put the "who do they follow" thing first?  Or second? I can't decide. */}

        <section aria-labelledby="who-follows-them">
          <h2 id="who-follows-them">Who follows <bdi>{person.displayName}</bdi>?</h2>

          {whoFollowsThem.length > 0 ?
            <ul aria-labelledby="who-follows-them">
            {whoFollowsThem.map(personWhoFollows => {
              return (<li key={personWhoFollows.handle}><PersonInline person={personWhoFollows} /></li>);
              }
            )}
            </ul>
            :
            <div>No one follows <bdi>{person.displayName}</bdi>.</div>
          }
        </section>

        <section aria-labelledby="who-do-they-follow">
          <h2 id="who-do-they-follow">Who does <bdi>{person.displayName}</bdi> follow?</h2>

          {whoDoTheyFollow.length > 0 ?
            <ul aria-labelledby="who-do-they-follow">
            {whoDoTheyFollow.map(personWhoIsFollowed => {
              return (<li key={personWhoIsFollowed.handle}><PersonInline person={personWhoIsFollowed} /></li>);
              }
            )}
            </ul>
            :
            <div><bdi>{person.displayName}</bdi> does not follow anyone.</div>
          }
        </section>
      </aside>

      <section className="their-posts" aria-labelledby="their-posts">
        <h2 id="their-posts">Posts by <bdi>{person.displayName}</bdi></h2>

        <PostsList posts={theirPosts} />
      </section>
    </main>
  );
}
