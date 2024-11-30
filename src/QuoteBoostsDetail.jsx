import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import PersonInline from './PersonInline.jsx';
import Post from './Post.jsx';
import PostsList from './PostsList.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

export default function QuoteBoostsDetail() {
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

  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(post.uri));

  // Scroll the post into view when it first becomes visible.
  const scrollHereRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, []);

  function getNumQuoteBoosts() { return postsDB.getNumberOfQuoteBoostsOf(post.uri); }
  function getNumYourQuoteBoosts() { return user? postsDB.getNumberOfQuoteBoostsOf(post.uri, {by: user.handle}) : 0; }
  const [numQuoteBoosts, setNumQuoteBoosts] = useState(getNumQuoteBoosts());
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(getNumYourQuoteBoosts());

  // Reset the boosts if you log in, so you can see if you're included among them.
  useEffect(() => {
    setNumQuoteBoosts(getNumQuoteBoosts());
    setNumYourQuoteBoosts(getNumYourQuoteBoosts());
  }, [user, setNumQuoteBoosts, setNumYourQuoteBoosts]);

  function getQuoteBoostPostsList() {
    const quoteBoostPosts = postsDB.getQuoteBoostsOf(post.uri);

    // We now have { handle1: boost-row-1, handle2: boost-row-2 }
    // We want a list of the boostersPosts.
    const quoteBoostPostsList = Object.values(quoteBoostPosts)
      .map(row => row.boostersPost)
    ;

    quoteBoostPostsList.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt)? 1 : 0);
    return quoteBoostPostsList;
  }

  const quoteBoostPostsList = getQuoteBoostPostsList();

  console.log(quoteBoostPostsList);

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
      <Post ref={postRef} post={post} numReplies={numReplies} setNumReplies={setNumReplies}
        onBoost={() => {
          setNumBoosts(getNumBoosts());
          setNumYourBoosts(getNumYourBoosts());
          setBoostPostsList(getBoostPostsList());
        }}
      />

      <h2>Quote-Boosted by {numQuoteBoosts} people</h2>

      <PostsList posts={quoteBoostPostsList} />

    </main>
    </>
  );
}
