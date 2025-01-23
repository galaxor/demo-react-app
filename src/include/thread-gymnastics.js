import hashSum from 'hash-sum'

/**
 * Given an initial post, load all the replies of the entire thread starting at that post.
 */
export function getRepliesTo(postRepliedTo, postsDB) {
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
 * The final output of this function will be:
 * [{inReplyTo, post}, ...]
 *
 * inReplyTo will be [{post, drawThreadLine: "thread-line-first"|"thread-line-continue"|"thread-line-branch"|"thread-line-last"|"thread-line-hide"}, ...]
 * Except right now, drawThreadLine will always be null.  That will be fixed up by computeThreadHandleVisibility.
 */
export function flattenThread(post, inReplyTo) {
  if (typeof inReplyTo === "undefined") {
    inReplyTo = [];
  }
  const threadOrder = [{post, inReplyTo: [...inReplyTo]}];
  if (typeof post.replies === "undefined") { post.replies = []; }
  post.replies.forEach(replyPost => threadOrder.push(...flattenThread(replyPost, [...inReplyTo, {post, drawThreadLine: null}])));

  return threadOrder;
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
export function computeThread(threadOrder) {
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

    // Is this the end of the subthread?
    // It is if there are no replies to this post and no further replies to whatever we're replying to.
    if (threadOrder[i].post.replies.length === 0
        && lastDirectReference[threadOrder[i].post.inReplyTo] === i)
    {
      // Outdent.
      threadHandles.pop();

      // Also, change branch-singleton to branch-singleton-end, and post-in-chain to post-in-chain-end.
      if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'branch-singleton') {
        threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'branch-singleton-end';
      } else if (threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph === 'post-in-chain') {
        threadOrder[i].threadHandles[threadOrder[i].threadHandles.length-1].glyph = 'post-in-chain-end';
      }
    }
  }

  makeThreadHandlesReal(threadOrder);
}

/**
 * After the main thread computation is done, the threadHandles structure has
 * "pointsTo", which is just an integer index into the threadOrder array, and
 * doesn't mean anything if you don't have the whole threadOrder array.
 * This function adds pointsToPost, which is the full post object.
 */
function makeThreadHandlesReal(threadOrder) {
  for (var i=0; i<threadOrder.length; i++) {
    for (var j=0; j<threadOrder[i].threadHandles.length; j++) {
      const pointsTo = threadOrder[i].threadHandles[j].pointsTo;
      const pointsToPost = threadOrder[pointsTo].post;
      threadOrder[i].threadHandles[j].pointsToPost = pointsToPost;
    }
  }
}


export function createStylesheetsForHover(threadOrder) {
  const hoverRules = [];
  threadOrder.forEach(({post}) => {
    const id = hashSum(post.uri).toString(16);

    // When we hover on a thread line, highlight all thread lines that go to the same post.
    hoverRules.push(`main#thread-main.thread:has(a.thread-handle[href="#p${id}"]:hover) a.thread-handle[href="#p${id}"] { border-color: hsl(var(--nextui-primary)); }`);

    // When we hover on a thread line, highlight the "corner" piece on the final post of the thread.
    hoverRules.push(`main#thread-main.thread:has(a.thread-handle[href="#p${id}"]:hover) li.thread-line-last a.thread-handle[href="#p${id}"] svg { color: hsl(var(--nextui-primary)); }`);

    // When we hover on a thread line, also highlight the "patch" that hangs out next to the post that the line is going to.
    hoverRules.push(`main#thread-main.thread:has(a.thread-handle[href="#p${id}"]:hover) div.threaded-post-${id} > ul > li:last-child::after { border-color: hsl(var(--nextui-primary)); }`);

    // When we hover on a thread line, highlight the actual post that is being pointed to.
    hoverRules.push(`main#thread-main.thread:has(a.thread-handle[href="#p${id}"]:hover) div#p${id} { outline-color: hsl(var(--nextui-primary)); }`);

  });

  const firstPostId = hashSum(threadOrder[0].post.uri).toString(16);

  // When we hover on a thread line going to the first post in the thread, its little "patch" should light up.
  hoverRules.push(`main.thread:has(a.thread-handle[href="#p${firstPostId}"]:hover) div.threaded-post-${firstPostId}::before { border-color: hsl(var(--nextui-primary)); }`);

  return hoverRules.join('\n');
}
