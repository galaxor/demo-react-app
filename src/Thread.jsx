import { PostsDB } from './logic/posts.js';

import { clickPost } from './clickPost.js'
import { closeReply } from './closeReply.js'
import hashSum from 'hash-sum'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

function getRepliesTo(postRepliedTo, postsDB, replyChain) {
  const threadOrder = [{inReplyTo: replyChain, post: postRepliedTo}];

  const inReplyTo = replyChain.concat(postRepliedTo);
  
  postsDB.getRepliesTo(postRepliedTo.uri).forEach(replyPost => {
    threadOrder.push(... getRepliesTo(replyPost, postsDB, inReplyTo));
  });
  
  return threadOrder;
}

function ThreadedPost({post, inReplyTo, className}) {
  return (
      <article className={"post flex border-2 border-solid border-foreground "+(className ?? "")} key={post.uri}>
        <ul className="w-1/2">
          {inReplyTo.map(precedentPost => {
            return (
            <li key={precedentPost.uri}>
              <span>{precedentPost.authorPerson.displayName}</span>
              <span>{precedentPost.text.substring(0, 20)}{precedentPost.text.length > 20? "..." : ""}</span>
            </li>
            );
          })}
        </ul>

        <div className="border-foreground w-1/2">
          {post.authorPerson.displayName}: {post.text}
        </div>
      </article>
  );
}


export default function Thread() {
  const mainPost = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postsDB = new PostsDB(db);

  // Calculate the entire thread, from knowing the main post.

  const originatingPost = (mainPost.conversationId === mainPost.uri || mainPost.conversationId === null)?
                          mainPost :
                          postsDB.get(mainPost.conversationId)
                          ;
  
  const threadOrder = getRepliesTo(originatingPost, postsDB, []);

  const mainPostIndex = threadOrder.findIndex(threadedPost => threadedPost.post.uri === mainPost.uri);

  // The replies to the main post consist of all posts after the main post,
  // which have the main post listed among the "inReplyTo".
  const replies = threadOrder
    .slice(mainPostIndex+1)
    .filter(({inReplyTo}) => inReplyTo.findIndex(reply => reply.uri === mainPost.uri) !== -1)
  ;

  // The post that started the thread, and all posts leading up to the main post (according to thread order).
  const threadContext = threadOrder.slice(0, mainPostIndex);

  // The other replies to the posts earlier in the thread, which are not replies to the main post.
  const threadRemainder = threadOrder.slice(mainPostIndex+1+replies.length);

  return <>
    <main className="thread">
      <h1 id="main-post-h1">Post by <bdi>{mainPost.authorPerson.displayName}</bdi>,{" "}
        <time dateTime={mainPost.createdAt}>
          <ReactTimeAgo date={new Date(mainPost.createdAt)} locale={languageContext} />
        </time>
        {mainPost.updatedAt !== mainPost.createdAt &&
          <>
          , updated {" "}
            <time dateTime={mainPost.updatedAt}>
              <ReactTimeAgo date={new Date(mainPost.updatedAt)} locale={languageContext} />
            </time>
          </>
        }
      </h1>

      <section className="main-post my-2" aria-labelledby="main-post-h1">
        <ThreadedPost key={threadOrder[mainPostIndex].post.uri} 
          post={threadOrder[mainPostIndex].post} 
          inReplyTo={threadOrder[mainPostIndex].inReplyTo} />
      </section>

      {replies.length === 0? "" :
        <>
        <h2 id="replies-h2">Replies</h2>

        <section className="replies my-2" aria-labelledby="replies-h2">
          {replies.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }

      {threadContext.length === 0? "" :
        <>
        <h2 id="thread-context-h2">Thread Context</h2>

        <section className="thread-context my-2" aria-babelledby="thread-context-h2">
          {threadContext.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }

      {threadRemainder.length === 0? "" :
        <>
        <h2 id="thread-remainder-h2">Remainder of the thread</h2>

        <section className="thread-remainder border-gold border-2 border-solid my-2" aria-babelledby="thread-remainder-h2">
          {threadRemainder.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }
    </main>
  </>;
}
