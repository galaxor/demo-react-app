import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

import './static/BoostsDetail.css'

export default function BoostsDetail() {
  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);
  const {user, setUser} = useContext(UserContext);

  const peopleDB = new PeopleDB(db);
  const postsDB = new PostsDB(db);

  // Scroll the post into view when it first becomes visible.
  const scrollHereRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, []);

  function getNumBoosts() { return postsDB.getNumberOfBoostsOf(post.uri); }
  function getNumYourBoosts() { return user? postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}) : 0; }
  const [numBoosts, setNumBoosts] = useState(getNumBoosts());
  const [numYourBoosts, setNumYourBoosts] = useState(getNumYourBoosts());

  // Reset the boosts if you log in, so you can see if you're included among them.
  useEffect(() => {
    setNumBoosts(getNumBoosts());
    setNumYourBoosts(getNumYourBoosts());
  }, [user, setNumBoosts, setNumYourBoosts]);

  function getBoostPostsList() {
    const boostPosts = postsDB.getBoostsOf(post.uri);

    // We now have { handle1: boost-row-1, handle2: boost-row-2 }
    // We want a list of the boostersPosts.
    const boostPostsList = Object.values(boostPosts)
      .map(row => row.boostersPost)
    ;

    boostPostsList.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt)? 1 : 0);
    return boostPostsList;
  }

  const [boostPostsList, setBoostPostsList] = useState(getBoostPostsList());

  // XXX You should be able to search the list of people who boosted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k boosts.

  return (
    <>
    <main className="post-single">
      <h1>Boosts for post by <bdi>{post.authorPerson.displayName}</bdi>,{" "}
        <time dateTime={post.createdAt}>
          <ReactTimeAgo date={new Date(post.createdAt)} locale={languageContext} />
        </time>
        {post.updatedAt !== post.createdAt &&
          <>
          , updated {" "}
            <time dateTime={post.updatedAt}>
              <ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />
            </time>
          </>
        }
      </h1>

      <SystemNotificationArea />

      <div ref={scrollHereRef} />
      <PostAndYourNewReplies post={post} 
        onBoost={() => {
          setNumBoosts(getNumBoosts());
          setNumYourBoosts(getNumYourBoosts());
          setBoostPostsList(getBoostPostsList());
        }
      } />

      <h2 className="my-5 text-xl font-bold">{numBoosts > 1 || numBoosts === 0 ? 
        <>Boosted by {numBoosts} people</>
        :
        <>Boosted by 1 person</>
      }</h2>

      {numBoosts <= 0? "No boosts." :
        <ul className="boosts-detail">
        {boostPostsList.map(post => {
          const key=encodeURIComponent(post.uri);
          const authorPerson = peopleDB.get(post.author);

          return (
            <li key={key}><PersonInline person={authorPerson} />
              <time dateTime={post.updatedAt}>
                <span className="time-ago"><ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} /></span>
                {" "} &mdash; {" "}
                <span className="abs-date">{dateFormat.format(new Date(post.updatedAt))}</span>
              </time>
            </li>
          );
        })}
        </ul>
      }

    </main>
    </>
  );
}
