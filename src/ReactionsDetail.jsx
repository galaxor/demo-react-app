import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import ReactionGlyph from './ReactionGlyph.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

import hashSum from 'hash-sum'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData, Link } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';
import {Tabs, Tab} from "@nextui-org/tabs";

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

  // Scroll the post into view when it first becomes visible.
  const scrollHereRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, []);

  const [reactionsList, setReactionsList] = useState(postsDB.getAllReactionsTo(post.uri));

  const [viewingReaction, setViewingReaction] = useState(document.location.hash);

  // XXX You should be able to search the list of people who reacted to the post.
  // Especially since, one day, this might be paged, in case some post has like 29k reactions.

  console.log(reactionsList);


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
      <PostAndYourNewReplies post={post}
        onReact={() => {
          setReactionsList(postsDB.getAllReactionsTo(post.uri));
        }}
      />

      <h2 id="reactions-toc-header" className="my-5 text-xl font-bold">Reactions</h2>

      {/* Make a table of contents of the different kinds of reactions */}
      {reactionsList.length <= 0?
        <> No reactions. </>
        :
        <Tabs aria-labelledby="reactions-toc-header">
          <Tab key="all" title="All">
            <h3 id="all-reactions" className="my-5 text-lg font-bold">All Reactions</h3>

            <ul className="reactors" aria-labelledby="all-reactions">
            {reactionsList.map(reactionType => {
              const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));

              return reactionType.reactors.map(person => {
                return (
                  <li key={key+':'+person.handle} className="reactor" className="flex gap-5 items-center"><ReactionGlyph reaction={reactionType} /> <PersonInline person={person} /></li>
                );
              })
            })}
            </ul>
          </Tab>

        {reactionsList.map(reactionType => {
          const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));

          return (
            <Tab key={key} title={<><ReactionGlyph reaction={reactionType} /> <span>{reactionType.reactors.length}</span></>}>
              <h3 id={key+'-header'} className="my-5 text-lg font-bold"><ReactionGlyph reaction={reactionType} /> <span>{reactionType.reactors.length}</span></h3>

              <ul className="reactors" aria-labelledby={key+'-header'}>
              {reactionType.reactors.map(person => {
                return (
                  <li key={key+':'+person.handle} className="reactor"><PersonInline person={person} /></li>
                );
              })}
              </ul>
            </Tab>
          );
        })}
        </Tabs>
      }
    </main>
    </>
  );
}
