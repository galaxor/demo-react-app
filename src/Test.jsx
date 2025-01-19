import { useContext } from 'react'

import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { flattenThread } from './include/thread-gymnastics.js'


function getRepliesTo(postRepliedTo, postsDB) {
  postRepliedTo.replies = postsDB.getRepliesTo(postRepliedTo.uri);
  postRepliedTo.replies.forEach(replyPost => getRepliesTo(replyPost, postsDB));
}

function findLastDirectReference(threadOrder) {
  const lastDirectReference = {};
  for (var i=threadOrder.length-1; i>=0; i--) {
    if (threadOrder[i].inReplyTo.length === 0) { continue; }
    const inReplyToUri = threadOrder[i].post.inReplyTo;
    // If we found a new direct reference to a thing, it was the last direct
    // reference because we're going backward.
    if (typeof lastDirectReference[inReplyToUri] === "undefined") {
      lastDirectReference[inReplyToUri] = i;
    }
  }

  return lastDirectReference;
}

function computeThread(threadOrder) {
  const lastDirectReference = findLastDirectReference(threadOrder);

  const threadHandles = [];
  for (var i=0; i<threadOrder.length; i++) {
    // The two questions are:  What's now?  What's next?

    // What's now?
    // Most of the time, we just believe what the last post told us was next.
    // (We can't do that in the first post, though).
    if (i===0) {
      threadOrder[i].threadHandles = [{pointsTo: 0, glyph: 'first-post'}];
    } else {
      threadOrder[i].threadHandles = [...threadHandles];
    }

    // What's next?
    if (i > 0 && threadHandles[threadHandles.length-1].glyph === 'start-branch') {
      // Our parent told us that we were the first post in a branch.  We've
      // drawn the 'start-branch' glyph.  Now, the size of threadHandles will
      // be expanded.  The next post will have one thread line pointing to our
      // parent, and one thread line pointing to us.
      threadHandles[threadHandles.length-1] = {pointsTo: i-1, glyph: 'continuance'};

      // But the thread line pointing to us:  What glyph does it use?
      if (threadOrder[i].post.replies.length === 1) {
        // If we have one reply, it's a post-in-chain.
        threadHandles.push({pointsTo: i, glyph: 'post-in-chain'});
      } else if (threadOrder[i].post.replies.length > 1) {
        // We have multiple replies.  That means this glyph should be either
        // 'start-branch', 'branch-singleton'.  It should be 'start-branch' if
        // our first reply has replies of its own, and 'branch-singleton' if
        // not.
        if (threadOrder[i+1].post.replies.length > 0) {
          threadOrder.push({pointsTo: i, glyph: 'start-branch'});
        } else {
          threadOrder.push({pointsTo: i, glyph: 'branch-singleton'});
        }
      }
    } else if (i > 0 && threadHandles[threadHandles.length-1].glyph === 'branch-singleton') {
      // The next post after a branch singleton.
      // Since we're a branch-singleton, we know we don't have replies,
      // meaning that the next post is either another reply to our parent, or
      // we're outdenting.
      // If it's another reply to our parent, then it might be a
      // 'start-branch', a 'branch-singleton', or a 'post-in-chain'.
    }


    if (threadOrder[i].post.replies === 1) {
      threadHandles.push({pointsTo: i, glyph: 'post-in-chain'});
    } else if (threadOrder[i].post.replies.length > 1) {
      // We're starting a branch.  There's a few different ways this could go:
      // If this is the last direct reference to its parent, let's just take over the thread line.
      // Otherwise, create a new thread line.
      const pointingTo = threadHandles[threadHandles.length-1];
      const pointingToUri = threadOrder[pointingTo].post.uri;
      const lastDirectReferenceToParent = lastDirectReference[pointingToUri];

    } else {
      // We are not a branch.  There are a few different ways to not be a branch.
      // We could be a "post-in-chain", a "branch-singleton", a
      // "branch-singleton-end", or a "thread-end".
      

      threadOrder[i].threadHandles = [...threadHandles];
    }

    
  }
}


export default function Test({db}) {
  const postsDB = new PostsDB(db);
  
  const originatingPost = postsDB.get('@testuser@local/c6006c83-e886-4cef-a970-ae4cfdb21fb7');
  getRepliesTo(originatingPost, postsDB);

  const threadOrder = flattenThread(originatingPost);
  computeThread(threadOrder);

  return (<>Check the console.</>);
}
