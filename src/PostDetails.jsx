import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import ReactionGlyph from './ReactionGlyph.jsx'
import PostDetailsContext from './PostDetailsContext.jsx';
import UserContext from './UserContext.jsx'

import hashSum from 'hash-sum'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData, useLocation, Link } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';
import {Tabs, Tab} from "@nextui-org/tabs";

export default function PostDetails({children}) {
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


  // Info for the reactions details.
  const [reactionsList, setReactionsList] = useState([]);

  const [viewingReaction, setViewingReaction] = useState(document.location.hash);


  // Info for the boost details.
  function getNumBoosts() { return postsDB.getNumberOfBoostsOf(post.uri); }
  function getNumYourBoosts() { return user? postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}) : 0; }
  const [numBoosts, setNumBoosts] = useState(getNumBoosts());
  const [numYourBoosts, setNumYourBoosts] = useState(getNumYourBoosts());

  useEffect(() => {
    (async () => {
      const allReactions = await postsDB.getAllReactionsTo(post.uri);
      setReactionsList(allReactions);
    })();
  }, []);

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

  // Figure out which tab is active, based on the url.
  const loc = useLocation();
  const activeTab = loc.pathname.replace(/^\/post\/([^\/]*)(\/([^\/]*))?/, '$3');

  // XXX You should be able to search the list of people who reacted to/boosted/quoted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k reactions.

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

      <div ref={scrollHereRef} />
      <PostAndYourNewReplies post={post}
        onReact={() => {
          setReactionsList(postsDB.getAllReactionsTo(post.uri));
        }}

        onBoost={() => {
          setNumBoosts(getNumBoosts());
          setNumYourBoosts(getNumYourBoosts());
          setBoostPostsList(getBoostPostsList());
        }}
      />

      <nav className="navigation-tabs" aria-labelledby="navigation">
        <h2 id="navigation" className="my-5 text-xl font-bold">Post Details</h2>
        <Tabs size="sm" selectedKey={activeTab} aria-labelledby="navigation">
          <Tab key="reactions" href={"/post/"+encodeURIComponent(post.uri)+"/reactions"} title="Reactions" />
          <Tab key="boosts" href={"/post/"+encodeURIComponent(post.uri)+"/boosts"} title="Boosts" />
          <Tab key="quote-boosts" href={"/post/"+encodeURIComponent(post.uri)+"/quote-boosts"} title="Quote Boosts" />
          <Tab key="history" href={"/post/"+encodeURIComponent(post.uri)+"/history"} title="Revision History"
               isDisabled={post.createdAt === post.updatedAt} />
        </Tabs>
      </nav>
    
      <PostDetailsContext.Provider value={{reactionsList, setReactionsList, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts, boostPostsList, setBoostPostsList}}>
        {children}
      </PostDetailsContext.Provider>

    </main>
    </>
  );
}
