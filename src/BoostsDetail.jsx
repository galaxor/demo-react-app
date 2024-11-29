import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import PersonInline from './PersonInline.jsx';
import Post from './Post.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

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

  const postRef = useRef();

  const [replies, setReplies] = useState(postsDB.getRepliesTo(post.uri));

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

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

  const boostPosts = postsDB.getBoostsOf(post.uri);

  // We now have { handle1: boost-row-1, handle2: boost-row-2 }
  // We want a list of the boostersPosts.
  const boostPostsList = Object.values(boostPosts)
    .map(row => row.boostersPost)
  ;

  boostPostsList.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt)? 1 : 0);

  // XXX You should be able to search the list of people who boosted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k boosts.

  return (
    <>
    <main className="post-single">
      <h1>Post by <bdi>{post.authorPerson.displayName}</bdi>,{" "}
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
      <Post ref={postRef} post={post} numReplies={numReplies} setNumReplies={setNumReplies} />

      <h2>Boosted by {numBoosts} people</h2>

      {numBoosts <= 0? "No boosts." :
        <ul>
        {boostPostsList.map(post => {
          const key=encodeURIComponent(post.uri);
          const authorPerson = peopleDB.get(post.author);

          return (
            <li key={key}><PersonInline person={authorPerson} /> at {" "}
              <time dateTime={post.updatedAt}>
                {dateFormat.format(new Date(post.updatedAt))}
                (<ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />)
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
