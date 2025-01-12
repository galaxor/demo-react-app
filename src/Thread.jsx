import { PostsDB } from './logic/posts.js';

import { clickPost } from './clickPost.js'
import { computeCollapsedReplyChains, computeThreadHandleVisibility, createStylesheetsForHover, flattenThread } from './include/thread-gymnastics.js'
import hashSum from 'hash-sum'
import MiniMap from './components/MiniMap.jsx'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import ThreadedPost from './components/ThreadedPost.jsx'

import './static/Thread.css'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

function getRepliesTo(postRepliedTo, postsDB) {
  postRepliedTo.replies = postsDB.getRepliesTo(postRepliedTo.uri);
  postRepliedTo.replies.forEach(replyPost => getRepliesTo(replyPost, postsDB));
}

function threadGymnastics(originatingPost, setOriginatingPost, setThreadOrder) {
  const threadOrder = flattenThread(originatingPost);

  computeThreadHandleVisibility(threadOrder);

  // Now collapse some reply chains so we don't have to indent if single posts reply to single posts.
  computeCollapsedReplyChains(threadOrder);

  setOriginatingPost({...originatingPost});

  setThreadOrder(threadOrder);
}

function findPost(uri, haystack) {
  if (haystack.uri === uri) { return haystack; }
  for (const reply of haystack.replies) {
    const foundPost = findPost(uri, reply);
    if (foundPost !== null) { return foundPost; }
  }

  return null;
}

function setRepliesFn(post, originatingPost, threadGymnastics, setOriginatingPost, setThreadOrder) {
  return replies => {
    // Find the post we're meant to add to, inside the originatingPost.
    const addToPost = findPost(post.uri, originatingPost);
    addToPost.replies = replies;

    threadGymnastics(originatingPost, setOriginatingPost, setThreadOrder);
  }
}

export default function Thread() {
  const mainPost = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postsDB = new PostsDB(db);

  const mainRef = useRef(null);

  // Make it so when you click a post, you go to its PostSingle page.
  useEffect(() => {
    const clickablePosts = mainRef.current.querySelectorAll('article.post > div.post')

    clickablePosts.forEach(node => {
      node.addEventListener('click', clickPost);
    });

    return(() => {
      clickablePosts.forEach(node => {
        node.removeEventListener('click', clickPost);
      });
    });
  });


  // Scroll the post into view when it first becomes visible.
  const mainPostScrollRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, []);

  // If we set a different post as the "scroll-to post", scroll to that one instead.
  // This happens when a reply is posted.
  const [scrollToPost, setScrollToPost] = useState(null);
  useEffect(() => {
    if (scrollToPost) {
      const scrollTarget = document.getElementById("scroll-target-p"+scrollToPost);
      if (scrollTarget) {
        scrollTarget.scrollIntoView();
        const divPost = scrollTarget.parentNode.parentNode;
        divPost.focus();
      }
    }
  }, [scrollToPost]);

  // Calculate the entire thread, from knowing the main post.

  const [originatingPost, setOriginatingPost] = useState(null);

  const [threadOrder, setThreadOrder] = useState(null);

  if (threadOrder === null) {
    const originatingPost = (mainPost.conversationId === mainPost.uri || !mainPost.conversationId)?
                            mainPost :
                            postsDB.get(mainPost.conversationId)
                            ;
  
    getRepliesTo(originatingPost, postsDB);

    threadGymnastics(originatingPost, setOriginatingPost, setThreadOrder);

    // When we do the thread gymnastics, it sets threadOrder, which redraws the page.
    // On the first go-through, it'll try to draw the page with threadOrder set
    // to null, and that isn't going to help anyone, so let's just go ahead and
    // return the empty string and let the page get redrawn with threadOrder
    // set.
    return "";
  }

  createStylesheetsForHover(threadOrder);

  // Chop the thread into the four sections:
  // * Main post (the one you clicked on)
  // * Replies to the main post
  // * Thread context (stuff that comes before the main post in thread order)
  // * Thread remainder (stuff that comes after the main post and its replies, in thread order)
  const mainPostIndex = threadOrder.findIndex(threadedPost => threadedPost.post.uri === mainPost.uri);

  // The replies to the main post consist of all posts after the main post,
  // which have the main post listed among the "inReplyTo".
  const replies = threadOrder
    .slice(mainPostIndex+1)
    .filter(({inReplyTo}) => inReplyTo.findIndex(reply => reply.post.uri === mainPost.uri) !== -1)
  ;

  // The post that started the thread, and all posts leading up to the main post (according to thread order).
  const threadContext = threadOrder.slice(0, mainPostIndex);

  // The other replies to the posts earlier in the thread, which are not replies to the main post.
  const threadRemainder = threadOrder.slice(mainPostIndex+1+replies.length);

  return <>
    <style type="text/css">{createStylesheetsForHover(threadOrder)}</style>

    <main id="thread-main" ref={mainRef} className="thread flex flex-wrap">
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

      <section className="main-post" aria-labelledby="main-post-h1">
        <ThreadedPost key={threadOrder[mainPostIndex].post.uri} 
          post={threadOrder[mainPostIndex].post} 
          setReplies={setRepliesFn(threadOrder[mainPostIndex].post, originatingPost, threadGymnastics, setOriginatingPost, setThreadOrder)}
          inReplyTo={threadOrder[mainPostIndex].inReplyTo}
          scrollRef={mainPostScrollRef}
          setScrollToPost={setScrollToPost}
        />
      </section>

      {replies.length === 0? "" :
        <>
        <h2 id="replies-h2" className="visually-hidden">Replies</h2>

        <section className="replies" aria-labelledby="replies-h2">
          {replies.map(({inReplyTo, post}) => {
            return (
              <ThreadedPost key={post.uri}
                post={post} 
                inReplyTo={inReplyTo}
                setReplies={setRepliesFn(post, originatingPost, threadGymnastics, setOriginatingPost, setThreadOrder)}
              />
            );
          })}
        </section>
        </>
      }

      {threadContext.length === 0? "" :
        <>
        <h2 id="thread-context-h2" className="visually-hidden">Thread Context</h2>

        <section className="thread-context" aria-labelledby="thread-context-h2">
          {threadContext.map(({inReplyTo, post}) => {
            return (
              <ThreadedPost key={post.uri}
                post={post} 
                inReplyTo={inReplyTo}
                setReplies={setRepliesFn(post, originatingPost, threadGymnastics, setOriginatingPost, setThreadOrder)}
              />
            );
          })}
        </section>
        </>
      }

      {threadRemainder.length === 0? "" :
        <>
        <h2 id="thread-remainder-h2" className="visually-hidden">Remainder of the thread</h2>

        <section className="thread-remainder" aria-labelledby="thread-remainder-h2">
          {threadRemainder.map(({inReplyTo, post}) => {
            return <ThreadedPost key={post.uri} post={post} inReplyTo={inReplyTo} />
          })}
        </section>
        </>
      }
    </main>

    <MiniMap threadOrder={threadOrder} />
  </>;
}
