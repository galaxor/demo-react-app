import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import PersonInline from './PersonInline.jsx';
import Post from './Post.jsx';
import ReactionGlyph from './ReactionGlyph.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

import hashSum from 'hash-sum'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData, Link } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

import './static/ReactionsDetail.css'

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

  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(post.uri));

  function getNumBoosts() { return postsDB.getNumberOfBoostsOf(post.uri); }
  function getNumYourBoosts() { return user? postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}) : 0; }
  const [numBoosts, setNumBoosts] = useState(getNumBoosts());
  const [numYourBoosts, setNumYourBoosts] = useState(getNumYourBoosts());

  // Scroll the post into view when it first becomes visible.
  const scrollHereRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, []);

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

  const [reactionsList, setReactionsList] = useState(postsDB.getAllReactionsTo(post.uri));

  const [viewingReaction, setViewingReaction] = useState(document.location.hash);

  // XXX You should be able to search the list of people who reacted to the post.
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

      <SystemNotificationArea />

      <div ref={scrollHereRef} />
      <Post ref={postRef} post={post} numReplies={numReplies} setNumReplies={setNumReplies}
        onBoost={() => {
          setNumBoosts(getNumBoosts());
          setNumYourBoosts(getNumYourBoosts());
          setBoostPostsList(getBoostPostsList());
        }}
        onReact={() => {
          setReactionsList(postsDB.getAllReactionsTo(post.uri));
        }}
      />

      <h2>Reactions</h2>

      {/* Make a table of contents of the different kinds of reactions */}
      {reactionsList.length <= 0?
        <> No reactions. </>
        :
        <ul className="reactions-toc">
          {reactionsList.map(reactionType => {
            const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));

            return (
              <li key={key}
                className={viewingReaction === '#'+key ? 'active' : ''}>
                <a href={'#'+key} onClick={() => setViewingReaction('#'+key)}>
                  <ReactionGlyph reaction={reactionType} /> <span>{reactionType.reactors.length}</span>
                </a>
              </li>
            );
          })}
        </ul>
      }

      {reactionsList.map(reactionType => {
        const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));
        return (
          <section key={key+'-section'} id={key} aria-labelledby={key+'-header'}
            className={viewingReaction === '#'+key ? 'active' : ''}
          >
            <h3 id={key+'-header'}><ReactionGlyph reaction={reactionType} /> <span>{reactionType.reactors.length}</span></h3>

            <ul className="reactors" aria-labelledby={key+'-header'}>
            {reactionType.reactors.map(person => {
              return (
                <li key={key+':'+person.handle} className="reactor"><PersonInline person={person} /></li>
              );
            })}
            </ul>
          </section>
        );
      })}

    </main>
    </>
  );
}
