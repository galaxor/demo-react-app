import hashSum from 'hash-sum'

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
 * At the end of this function, each post in the threadOrder will have its
 * inReplyTo's updated, to say which thread lines to show and hide, and which
 * to draw as the "last" post in a subthread (that is, the last direct reply to
 * a post).
 * The threadOrder array will be modified.
 * threadOrder[i].inReplyTo[j].drawThreadLine will be set to one of:
 * "thread-line-first" | "thread-line-continue" | "thread-line-branch" | "thread-line-last" | "thread-line-hide".
 *
 * However, "first" and "last" can be combined to get "thread-line-first thred-line-last".
 *
 * That will get added as a CSS class when the thread handles are drawn into
 * the HTML.
 */
export function computeThreadHandleVisibility(threadOrder) {
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

    // If this is a direct reply to something, and we have no record of there
    // being another direct reply to it, then this is the last direct reply
    // to it, because we're traversing thread order backward.
    if (typeof lastDirectReplyTo[directlyRepliedTo.post.uri] === "undefined") {
      lastDirectReplyTo[directlyRepliedTo.post.uri] = i;

      // Make a new copy of "inReplyTo" to make sure writes to other instances'
      // drawThreadLine don't mess with this one.
      threadOrder[i].inReplyTo[inReplyTo.length-1] = {
        ...(threadOrder[i].inReplyTo[inReplyTo.length-1]),
        drawThreadLine: "thread-line-last",
      };
    } else {
      // If this is not the last reply to a thing, then our parent has a branch
      // in it.  Let's note that in the level up, because that means that we
      // won't be able to collapse the thread.
      if (inReplyTo.length > 1) {
        threadOrder[i].inReplyTo[inReplyTo.length-2].hasBranch = true;
      }
    }

    // Mark if someone has replied to this post.
    if (typeof lastDirectReplyTo[threadOrder[i].post.uri] !== "undefined") {
      threadOrder[i].inReplyTo[inReplyTo.length-1].hasReplies = true;
    }

    // Now check if we should show or hide the rest of the reply lines in the reply chain.
    for (var j=0; j<=inReplyTo.length-2; j++) {
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
          drawThreadLine: "thread-line-continue",
        };
      }
    }
  }

  // Now we're going to traverse the thread in the other direction and find
  // which post is the *first* direct reply to a particular post.
  const firstDirectReplyTo = {};

  for (var i=0; i<threadOrder.length; i++) {
    const {inReplyTo} = threadOrder[i];
    const directlyRepliedTo = inReplyTo[inReplyTo.length-1];
    if (typeof directlyRepliedTo === "undefined") {
      // If this is not in reply to anything, it must be the top post of the thread.
      continue;
    }
    
    // If this is a direct reply to something, then it's the first direct reply
    // to it, because we're traversing thread order forward.

    // There are four outcomes here:
    // * This is the first reply, but not the last reply.
    // * This is the first reply and the last reply.
    // * This is both the first and last reply.
    // * This is neither the first nor the last reply, in which case it's a branch.

    if (typeof firstDirectReplyTo[directlyRepliedTo.post.uri] === "undefined") {
      firstDirectReplyTo[directlyRepliedTo.post.uri] = i;

      // Make a new copy of "inReplyTo" to make sure writes to other instances'
      // drawThreadLine don't mess with this one.

      // This is either the first reply, or it's the first *and last* direct reply to this post.
      const firstLast = (lastDirectReplyTo[directlyRepliedTo.post.uri] === i)?
        "thread-line-first thread-line-last"
        : "thread-line-first"
      ;

      threadOrder[i].inReplyTo[inReplyTo.length-1] = {
        ...(threadOrder[i].inReplyTo[inReplyTo.length-1]),
        drawThreadLine: firstLast,
      };
    } else {
      // The first reply is known.  Is the last reply also known, and known to
      // be something other than this post?
      // If so, this is a branch.
      if (lastDirectReplyTo[directlyRepliedTo.post.uri] !== i) {
        threadOrder[i].inReplyTo[inReplyTo.length-1] = {
          ...(threadOrder[i].inReplyTo[inReplyTo.length-1]),
          drawThreadLine: "thread-line-branch",
        };
      }
    }
  }
}

/**
 * In computeThreadHandleVisibility, we computed what the thread would look
 * like if we just drew it out as the thread is laid out -- Every time there's
 * a reply, we indent.
 * However, we can draw it more compactly if we identify "collapsed reply
 * chains" -- that is, if there's posts A, B, C, where B replies to A and C
 * replies to B, and there's no other replies, then we don't need to draw them
 * as if they're new branches.  Just draw a line straight down and don't
 * indent.
 * This is a "collapsed reply chain".  Let's re-traverse the thread and mark
 * posts that can be collapsed.
 * Each thread handle can be drawn as one of three types of collapsed ways.  If
 * any of these are set, it overrides whatever the result was of
 * computeThreadHandleVisibility.
 * The three types of things are:
 * - collapsed-first
 * - collapsed-last
 * - collapsed-hidden
 *
 * Collapsed-first is set on the thread handle that points back to the first
 * post of this collapsed reply chain.  People can click on that anywhere in
 * the reply chain and find where the collapsed reply chain originated.
 *
 * Collapsed-last is the same, except there are no further replies in this
 * subthread.  This can be visually indicated.
 *
 * Collapsed-hidden is for thread handles that point to posts after the first
 * one of the chain.  Those should just not be drawn at all, and should take up
 * no space.  We should only be drawing the handle that points to the initial
 * post in the collapsed reply chain.
 *
 */
export function computeCollapsedReplyChains(threadOrder) {
  // For each post, mark the last time it was replied to directly.
    // lastDirectReplyTo will contain {postUri: index, ...}.
  for (var i=threadOrder.length-1; i>=0; i--) {
    const {inReplyTo} = threadOrder[i];

    // Check if this reply line should be totally collapsed because it is a subsequent post in a collapsed reply chain.
    // * Its parent exists and has one reply
    // * This post has zero or one reply
    // * If it has one reply, that reply has zero or one replies.
    if (
      // Its parent does not exist or has more than one reply
      (inReplyTo.length > 0 && threadOrder[i].inReplyTo[inReplyTo.length-1].post.replies.length === 1)

      // Check if this post has zero or one reply
      && [0,1].includes(threadOrder[i].post.replies.length)

      // Check if this post's reply has zero or one replies.
      && (threadOrder[i].post.replies.length === 0 || [0,1].includes(threadOrder[i].post.replies[0].replies.length)))
    {
      threadOrder[i].inReplyTo[inReplyTo.length-1].collapsed = 'collapsed-hidden';
    }

    // It's possible to meet the criteria for both "collapsed-hidden" and "collapsed-first".
    // If that happens, we want "collapsed-first" to win, so let's check for that last.

    // Check if this reply line should be the first in a collapsed reply chain.
    // If it's like that, then it shouldn't be drawn like a "thread-line-continue".
    // That is true if all of:
    // * Its parent exists and has one reply.
    // * Its parent's parent doesn't exist, or has more than one reply.
    // * It has zero or one reply.
    // * If it has one reply, the reply has zero or one replies.
    if (
      // * Its parent exists and has one reply.
      (inReplyTo.length > 0 && threadOrder[i].inReplyTo[inReplyTo.length-1].post.replies.length === 1)

      // * Its parent's parent doesn't exist, or has more than one reply.
      && (inReplyTo.length < 2 || threadOrder[i].inReplyTo[inReplyTo.length-2].post.replies.length > 1)

      // * It has zero or one reply.
      && [0,1].includes(threadOrder[i].post.replies.length)

      // * If it has one reply, the reply has zero or one replies.
      /* && (threadOrder[i].post.replies.length === 0 || [0,1].includes(threadOrder[i].post.replies[0].replies.length)) */)
    {
      // So, this is the handle that points to the first post in the
      // collapsed reply chain.  But is it the LAST such post?
      // If so, we should indicate the end of the collapsed reply chain.

      // It's the last reply in the chain if EITHER:
      // * This is the last post in threadOrder, OR
      // * The next post in threadOrder does not contain a reference to the
      //   post that this handle references.
      if (i === threadOrder.length-1 || typeof threadOrder[i+1].inReplyTo.find(({post}) => post.uri === threadOrder[i].inReplyTo[inReplyTo.length-1].post.uri) === "undefined") {
        threadOrder[i].inReplyTo[inReplyTo.length-1].collapsed = 'collapsed-last';
      } else {
        threadOrder[i].inReplyTo[inReplyTo.length-1].collapsed = 'collapsed-first';
      }
    }
    
    // Now check if we should show or hide the rest of the reply lines in the reply chain.
    for (var j=0; j<=inReplyTo.length-2; j++) {
      // Check if this reply line should be totally collapsed because it is
      // about a subsequent post in a collapsed reply chain.
      // * Its parent exists and has one reply
      // * This post has zero or one reply
      // * If it has one reply, that reply has zero or one replies.
      if (
        // Its parent exists and has one reply
        (j > 0 && threadOrder[i].inReplyTo[j-1].post.replies.length === 1)

        // Check if this post has zero or one reply
        && [0,1].includes(threadOrder[i].inReplyTo[j].post.replies.length)

        // Check if this post's reply has zero or one replies.
        && (threadOrder[i].inReplyTo[j].post.replies.length === 0 || [0,1].includes(threadOrder[i].inReplyTo[j].post.replies[0].replies.length)))
      {
        threadOrder[i].inReplyTo[j].collapsed = 'collapsed-hidden';
      }

      // It's possible to meet the criteria for both "collapsed-hidden" and "collapsed-first".
      // If that happens, we want "collapsed-first" to win, so let's check for that last.

      // Check if this reply line should be the first in a collapsed reply chain.
      // If it's like that, then it shouldn't be drawn like a "thread-line-continue".
      // That is true if all of:
      // * Its parent doesn't exist, or exists and has more than one reply.
      // * It has zero or one reply.
      // * If it has one reply, the reply has zero or one replies.
      if (
        // * Its parent doesn't exist, or exists and has more than one reply.
        (j === 0 || threadOrder[i].inReplyTo[j-1].post.replies.length > 1)

        // * It has zero or one reply.
        && [0,1].includes(threadOrder[i].inReplyTo[j].post.replies.length)

        // * If it has one reply, the reply has zero or one replies.
        && [0,1].includes(threadOrder[i].inReplyTo[j].post.replies[0].replies.length))
      {
        // So, this is the handle that points to the first post in the
        // collapsed reply chain.  But is it the LAST such post?
        // If so, we should indicate the end of the collapsed reply chain.

        // It's the last reply in the chain if EITHER:
        // * This is the last post in threadOrder, OR
        // * The next post in threadOrder does not contain a reference to the
        //   post that this handle references.
        if (i === threadOrder.length-1 || typeof threadOrder[i+1].inReplyTo.find(({post}) => post.uri === threadOrder[i].inReplyTo[j].post.uri) === "undefined") {
          threadOrder[i].inReplyTo[j].collapsed = 'collapsed-last';
        } else {
          threadOrder[i].inReplyTo[j].collapsed = 'collapsed-first';
        }
      }

      // If it would otherwise be a collapsed-first or collapsed-last, but its
      // reply's reply has more than one reply (is a branch), then it
      // becomes a "collapsed-hidden" instead of a "collapsed-first", because
      // the post that branches out will hijack the collapsed reply chain.
      if (['collapsed-first', 'collapsed-last'].includes(threadOrder[i].inReplyTo[j].collapsed)
          && threadOrder[i].inReplyTo[j].post.replies[0].replies.length === 1
          && threadOrder[i].inReplyTo[j].post.replies[0].replies[0].replies.length > 1) 
      {
        threadOrder[i].inReplyTo[j].collapsed = 'collapsed-hidden';
      }
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
