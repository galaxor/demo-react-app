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

function inverseThreadOrder(threadOrder) {
  const uriToThreadOrder = [];
  for (var i=0; i<threadOrder.length; i++) {
    uriToThreadOrder[threadOrder[i].post.uri] = i;
  }
  return uriToThreadOrder;
}

function computeThread(threadOrder) {
  const lastDirectReference = findLastDirectReference(threadOrder);
  const uriToThreadOrder = inverseThreadOrder(threadOrder);

  const threadHandles = [];
  for (var i=0; i<threadOrder.length; i++) {
    const inReplyTo = threadOrder[i].inReplyTo;

    // The two questions are:  What's now?  What's next?

    // What's now?
    // Most of the time, we just believe what the last post told us was next.
    // (We can't do that in the first post, though).
    if (i===0) {
      threadOrder[i].threadHandles = [{pointsTo: 0, glyph: 'first-post'}];
      threadHandles.push({pointsTo: 0, glyph: 'continuance'});
    } else if (inReplyTo[inReplyTo.length-1].post.replies.length === 1) {
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: threadHandles[threadHandles.length-1].pointsTo, glyph: 'post-in-chain'});
    } else if (inReplyTo[inReplyTo.length-1].post.replies.length > 1 && threadOrder[i].post.replies.length === 0) {
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'branch-singleton'});
    } else if (inReplyTo[inReplyTo.length-1].post.replies.length > 1 && threadOrder[i].post.replies.length > 0) {
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'start-branch'});

      // Hijack the thread line, for future posts. It now points to us.
      threadHandles.pop();
      threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'continuance'});

      // And the branch should also have a thread line that points to us.
      threadHandles.push({pointsTo: i, glyph: 'continuance'});
    } else {
      console.log("Woops, what's this situation?  What should I do?");
    }


    var keepGoing;
    do {
      keepGoing = false;
      const myThreadLeaderIndex = threadHandles[threadHandles.length-1].pointsTo;
      const myThreadLeader = threadOrder[myThreadLeaderIndex];
      if (lastDirectReference[myThreadLeader.post.uri] === i) {
        console.log(i, "Jettisoning", [...threadHandles]);
        keepGoing = true;
        const floop = threadHandles.pop();
        console.log("jettisoned", floop);
      }
    } while (keepGoing && threadHandles.length > 0);
  }

  // I'm going to take another pass, to make sure that ends-of-subthreads are
  // marked the way I want them to be.  We could have done this logic above,
  // but I wanted that logic to be clear to understand and I thought adding
  // this complication would make it more difficult to read, so I separated it
  // into this section.
  // What we're doing here is that branch-singleton's may be
  // branch-singleton-end's if they have no replies.  And post-in-chain's may
  // be post-in-chain-end's if they have no replies.
  for (var i=0; i<threadOrder.length; i++) {
    if (threadOrder[i].post.replies.length === 0) {
      if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'branch-singleton') {
        threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'branch-singleton-end';
      } else if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'post-in-chain') {
        threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'post-in-chain-end';
      }
    }
  }

  console.log(threadOrder);
}


export default function Test({db}) {
  const postsDB = new PostsDB(db);
  
  const originatingPost = postsDB.get('@testuser@local/3c5ae400-7bbe-4d73-b690-5267b3fa3826');
  getRepliesTo(originatingPost, postsDB);

  const threadOrder = flattenThread(originatingPost);
  computeThread(threadOrder);

  return (<>
    {threadOrder.map(threadedPost => {
      return (<div className="flex">
        {threadedPost.threadHandles.map(threadHandle => {
          return <span>{threadHandle.glyph}({threadOrder[threadHandle.pointsTo].post.text}) {" "}</span>;
        })}
        <span>:: {threadedPost.post.text}</span>
      </div>
      );
    })}
  </>);
}
