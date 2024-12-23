import { PostsDB } from './logic/posts.js';

import { clickPost } from './clickPost.js'
import { closeReply } from './closeReply.js'
import hashSum from 'hash-sum'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import './static/Thread.css'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

/**
 * inReplyTo will be [{post: (a post), drawThreadLine: String}, ...]
 * Where drawThreadLine is thread-line-show | thread-line-hide | thread-line-last.
 * Although drawThreadLine will be null now.  It will get figured out later.
 */
function getRepliesTo(postRepliedTo, postsDB, replyChain) {
  const threadOrder = [{inReplyTo: replyChain, post: postRepliedTo}];

  const inReplyTo = replyChain.concat({post: postRepliedTo, drawThreadLine: null});
  
  postsDB.getRepliesTo(postRepliedTo.uri).forEach(replyPost => {
    threadOrder.push(... getRepliesTo(replyPost, postsDB, inReplyTo));
  });
  
  return threadOrder;
}

function ThreadedPost({post, inReplyTo, className}) {
  return (
      <article className={"post flex border-2 border-solid border-foreground "+(className ?? "")} key={post.uri}>
        <ul className="w-1/2">
          {inReplyTo.map(({post, drawThreadLine})  => {
            return (
            <li key={post.uri} className={drawThreadLine}>
              {post.drawThreadLine}
              <span>{post.authorPerson.displayName}</span>
              <span>{post.text.substring(0, 20)}{post.text.length > 20? "..." : ""}</span>
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

  // For each post, mark the last time it was replied to directly.
    // lastDirectReplyTo will contain {postUri: index, ...}.
  const lastDirectReplyTo = {};
  for (var i=threadOrder.length-1; i>=0; i--) {
    const {inReplyTo} = threadOrder[i];
    const directlyRepliedTo = inReplyTo[inReplyTo.length-1];

    if (typeof directlyRepliedTo === "undefined") {
      // If this is not in reply to anything, it must be the top post of the thread.
      continue;
    }

    // If this is a direct reply to something, then it's the last direct reply
    // to it, because we're traversing thread order backward.
    if (typeof lastDirectReplyTo[directlyRepliedTo.post.uri] === "undefined") {
      lastDirectReplyTo[directlyRepliedTo.post.uri] = i;

      // Make a new copy of "inReplyTo" to make sure writes to other instances'
      // drawThreadLine don't mess with this one.
      threadOrder[i].inReplyTo[inReplyTo.length-1] = {
        ...(threadOrder[i].inReplyTo[inReplyTo.length-1]),
        drawThreadLine: "thread-line-last",
      };
    }

    // Now check if we should show or hide the rest of the reply lines in the reply chain.
    for (var j=0; j<inReplyTo.length-2; j++) {
      // If the last reply is in the future, we know we must draw this line.
      // If the last reply is not in the future or the present, then we know
      // it's in the past and we should not draw the line.
      // We know it's not in the present because if it was, it would be the
      // last direct reply, which we are not considering in this loop.

      if (typeof lastDirectReplyTo[inReplyTo[j].post.uri] === "undefined") {
        // If we haven't seen the last reply to this post yet, then we know
        // that the last reply is in the past (because we're traversing thread
        // order in reverse).  Therefore, we know we should hide this thread
        // line.
        threadOrder[i].inReplyTo[j] = {
          ...(threadOrder[i].inReplyTo[j]),
          drawThreadLine: "thread-line-hide",
        };
      } else {
        threadOrder[i].inReplyTo[j] = {
          ...(threadOrder[i].inReplyTo[j]),
          drawThreadLine: "thread-line-show",
        };
      }
    }
  }

  console.log(threadOrder);

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

        <section className="thread-context my-2" aria-labelledby="thread-context-h2">
          {threadContext.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }

      {threadRemainder.length === 0? "" :
        <>
        <h2 id="thread-remainder-h2">Remainder of the thread</h2>

        <section className="thread-remainder border-gold border-2 border-solid my-2" aria-labelledby="thread-remainder-h2">
          {threadRemainder.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }
    </main>
  </>;
}
