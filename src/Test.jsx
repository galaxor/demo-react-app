import { useContext } from 'react'

import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { flattenThread } from './include/thread-gymnastics.js'


/**
 * Given an initial post, load all the replies of the entire thread starting at that post.
 */
function getRepliesTo(postRepliedTo, postsDB) {
  postRepliedTo.replies = postsDB.getRepliesTo(postRepliedTo.uri);
  postRepliedTo.replies.forEach(replyPost => getRepliesTo(replyPost, postsDB));
}

/**
 * Create a map that maps a uri to an index (of threadOrder), where that index
 * is the post that last directly replied to the post given in the uri.
 */
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

/**
 * Create an inverse map of threadOrder. Given a uri, what index does it sit at in the thread order?
 */
function inverseThreadOrder(threadOrder) {
  const uriToThreadOrder = [];
  for (var i=0; i<threadOrder.length; i++) {
    uriToThreadOrder[threadOrder[i].post.uri] = i;
  }
  return uriToThreadOrder;
}

/**
 * This takes the threadOrder array and computes what the "thread handles"
 * should be.
 * The "thread handles" are the lines that show the user how the thread is
 * connected up -- what posts are replies to what other posts.
 * We want to draw lines next to the posts, so that if someone hovers on that
 * line, it highlights the line, all the way up to the post that started that
 * subthread.  And if you click on that line, it scrolls you to the post that
 * started the subthread.
 * And a post might have more than one "threadHandle", if the reply chain is
 * deeply branching.
 * We are given threadOrder = [{post: <the post, where .replies is a list of the replies to that post>}, ...]
 * For each element of threadOrder, we add .threadHandles = [{pointsTo: int, glyph: "..."}, ...].
 * The integer in "pointsTo" is an index into the threadOrder array, saying
 * "this post's thread-predecessor is that post".  That is, threadOrder[i]'s
 * thread-predecessor is threadOrder[pointsTo].
 * The "glyph" is which glyph to draw in that position, when drawing the
 * thread.  The possible "glyphs" are:
 * - first-post
 * - post-in-chain: If a thread doesn't branch -- that is, C replies to B
 *     replies to A, and there are no branches, then we can draw a straight line
 *     from A to C, and there's no need to indent.
 * - branch-start: If a post has multiple replies, then we want to draw a
 *     little "wishbone" shape to show that we're starting a new thread and
 *     indenting.
 * - branch-singleton: This shows that we have a post that branches off of the
 *     main thread, but has no replies of its own.
 * - continuance: If we're showing a subthread, but later on, another post
 *     replies to the same post that started this subthread, then we'll draw a
 *     "continuance", showing that this links back up to the older post, but the
 *     real action is in this subthread.  Every time we start a new branch and
 *     indent, we'll have a "continuance", leading us back up to the post that
 *     started that branch.  So a post may have many continuances and then the
 *     more exciting glyph on its subthread.
 *
 * And finally, we have some variants for when there are no replies to a
 * particular subthread.
 * - branch-singleton-end: This is a branch-singleton, but it's the final post
 *     that replies to the post that it replies to.  Don't draw a continuing line.
 * - post-in-chain-end: The last post in a reply chain.
 */
function computeThread(threadOrder) {
  const lastDirectReference = findLastDirectReference(threadOrder);
  const uriToThreadOrder = inverseThreadOrder(threadOrder);

  const threadHandles = [];
  for (var i=0; i<threadOrder.length; i++) {
    const inReplyTo = threadOrder[i].inReplyTo;

    if (i===0) {
      // The first post always gets a special glyph: 'first-post'.
      threadOrder[i].threadHandles = [{pointsTo: 0, glyph: 'first-post'}];
      threadHandles.push({pointsTo: 0, glyph: 'continuance'});

    } else if (inReplyTo[inReplyTo.length-1].post.replies.length === 1) {
      // This is the next post in a well-behaved reply chain: Each post replies to the previous post, no branching.
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: threadHandles[threadHandles.length-1].pointsTo, glyph: 'post-in-chain'});

    } else if (inReplyTo[inReplyTo.length-1].post.replies.length > 1 && threadOrder[i].post.replies.length === 0) {
      // This is a branch off of a previous post, but it doesn't start its own subthread.
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'branch-singleton'});

    } else if (inReplyTo[inReplyTo.length-1].post.replies.length > 1 && threadOrder[i].post.replies.length > 0) {
      // This is a branch off a previous post, and it does start its own subthread.
      threadOrder[i].threadHandles = [...threadHandles];
      threadOrder[i].threadHandles.pop();
      threadOrder[i].threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'start-branch'});

      // Hijack the thread line, for future posts. It now points to us.
      threadHandles.pop();
      threadHandles.push({pointsTo: uriToThreadOrder[threadOrder[i].post.inReplyTo], glyph: 'continuance'});

      // And the branch should also have a thread line that points to us.
      threadHandles.push({pointsTo: i, glyph: 'continuance'});
    } else {
      console.warn("Found an unimplemented threading situation.");
    }


    // This is how we detect the end of a subthread.  When we hit the end of a
    // subthread, we outdent (by popping things off threadHandles).
    var keepGoing;
    do {
      keepGoing = false;

      // We outdent if this post was the last one that directly replied to the
      // post that started this branch:  The branch is over.
      const myThreadLeaderIndex = threadHandles[threadHandles.length-1].pointsTo;
      const myThreadLeader = threadOrder[myThreadLeaderIndex];
      if (lastDirectReference[myThreadLeader.post.uri] === i) {
        threadHandles.pop();

        // If we popped something, see if there's more to pop.  Like, maybe we
        // have to outdent by two or more!
        keepGoing = true;
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
    const threadHandles = threadOrder[i].threadHandles;
    const directlyRepliesToIndex = threadHandles[threadHandles.length-1].pointsTo;
    const directlyRepliesToUri = threadOrder[directlyRepliesToIndex].post.uri;

    if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'branch-singleton'
        && lastDirectReference[directlyRepliesToUri] === i)
    {
      threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'branch-singleton-end';
    } else if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'post-in-chain'
               && threadOrder[i].post.replies.length === 0) 
    {
      threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'post-in-chain-end';
    }
  }
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
