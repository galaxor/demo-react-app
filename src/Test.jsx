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
    if (i===0) {
      // This is the first post in the thread.
      threadOrder[i].threadHandles = [{pointsTo: 0, glyph: 'first-post'}];
      threadHandles = [{pointsTo: 0, glyph: 'post-in-chain'}];
    } else if (threadOrder[i].post.replies.length > 1) {
      // We're starting a branch.  There's a few different ways this could go:
      // If this is the last direct reference to its parent, let's just take over the thread line.
      // Otherwise, create a new thread line.
      const pointingTo = threadHandles[threadHandles.length-1];
      const pointingToUri = threadOrder[pointingTo].post.uri;
      const lastDirectReferenceToParent = lastDirectReference[pointingToUri];

      if (lastDirectReferenceToParent > i) {
        // This is not the last post to reply directly to this post's parent.
        // That means this post can't take over the thread line, it needs to
        // create a new thread line which will indent.
        threadOrder[i].threadHandles = [
          ...threadHandles.slice(0, threadHandles.length-1),
          {pointsTo: threadHandles[threadHandles.length-1].pointsTo,
           glyph: 'post-in-chain',
          }
        ];

        // Now, the next post needs its orders of what the thread handles are.
        threadHandles.push({pointsTo: i, glyph: 'start-branch'});
      } else {
        // This is the last post to reply directly to this post's parent.
        // That means this post can take over the thread line, and doesn't need
        // to branch or indent.
        threadOrder[i].threadHandles = [
          ...threadHandles.slice(0, threadHandles.length-1),
          {
            pointsTo: i,
            glyph: 'post-in-chain',
          },
        ];

        // Now, the next post needs its orders of what the thread handles are.
        lastThreadHandles = [...threadHandles];
        threadHandles.pop();
        threadHandles.push(i);
      }
    } else {
      // Was our parent a branch?
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
